// =================================================================
// Servicio de Conectividad y Estado Offline - QRScanLDA
// =================================================================

import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export interface ConnectivityState {
  isConnected: boolean;
  connectionType: string;
  isInternetReachable: boolean | null;
}

export interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: 'prospect' | 'exhibitor' | 'event';
  data: any;
  timestamp: number;
  retryCount: number;
}

class ConnectivityService {
  private static instance: ConnectivityService;
  private connectionState: ConnectivityState = {
    isConnected: false,
    connectionType: 'unknown',
    isInternetReachable: null
  };
  private listeners: ((state: ConnectivityState) => void)[] = [];
  private syncQueue: OfflineAction[] = [];
  private isInitialized = false;

  static getInstance(): ConnectivityService {
    if (!ConnectivityService.instance) {
      ConnectivityService.instance = new ConnectivityService();
    }
    return ConnectivityService.instance;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Cargar acciones pendientes del almacenamiento local
      await this.loadOfflineQueue();

      // Configurar listener de conectividad
      const unsubscribe = NetInfo.addEventListener(state => {
        const newState: ConnectivityState = {
          isConnected: state.isConnected ?? false,
          connectionType: state.type,
          isInternetReachable: state.isInternetReachable
        };

        const wasOffline = !this.connectionState.isConnected;
        this.connectionState = newState;

        // Notificar listeners
        this.listeners.forEach(listener => listener(newState));

        // Si acabamos de conectarnos, procesar cola offline
        if (wasOffline && newState.isConnected) {
          this.processOfflineQueue();
        }
      });

      this.isInitialized = true;
      console.log('ConnectivityService initialized');
    } catch (error) {
      console.error('Error initializing ConnectivityService:', error);
    }
  }

  // Obtener estado actual de conectividad
  getCurrentState(): ConnectivityState {
    return { ...this.connectionState };
  }

  // Verificar si estamos online
  isOnline(): boolean {
    return this.connectionState.isConnected && 
           this.connectionState.isInternetReachable !== false;
  }

  // Agregar listener para cambios de conectividad
  addListener(listener: (state: ConnectivityState) => void) {
    this.listeners.push(listener);
    // Inmediatamente llamar con el estado actual
    listener(this.connectionState);

    // Retornar función para remover listener
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Agregar acción a la cola offline
  async addOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>) {
    const offlineAction: OfflineAction = {
      ...action,
      id: Date.now().toString(),
      timestamp: Date.now(),
      retryCount: 0
    };

    this.syncQueue.push(offlineAction);
    await this.saveOfflineQueue();

    console.log(`Offline action added: ${offlineAction.type} ${offlineAction.entityType}`);
  }

  // Procesar cola de acciones offline
  async processOfflineQueue() {
    if (!this.isOnline() || this.syncQueue.length === 0) {
      return;
    }

    console.log(`Processing ${this.syncQueue.length} offline actions`);

    const actionsToRetry: OfflineAction[] = [];
    
    for (const action of this.syncQueue) {
      try {
        await this.executeOfflineAction(action);
        console.log(`Successfully processed offline action: ${action.id}`);
      } catch (error) {
        console.error(`Failed to process offline action ${action.id}:`, error);
        
        action.retryCount++;
        if (action.retryCount < 3) {
          actionsToRetry.push(action);
        } else {
          console.error(`Offline action ${action.id} failed after 3 retries, discarding`);
          this.showSyncError(action);
        }
      }
    }

    this.syncQueue = actionsToRetry;
    await this.saveOfflineQueue();

    if (this.syncQueue.length === 0) {
      Alert.alert('Sincronización', 'Todas las acciones offline se procesaron exitosamente');
    }
  }

  // Ejecutar una acción offline específica
  private async executeOfflineAction(action: OfflineAction) {
    // Aquí conectaríamos con el servicio de sincronización de Supabase
    // Por ahora simulamos el éxito
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`Executing ${action.type} for ${action.entityType}:`, action.data);
  }

  // Cargar cola offline del almacenamiento
  private async loadOfflineQueue() {
    try {
      const queueData = await AsyncStorage.getItem('offline_sync_queue');
      if (queueData) {
        this.syncQueue = JSON.parse(queueData);
        console.log(`Loaded ${this.syncQueue.length} offline actions from storage`);
      }
    } catch (error) {
      console.error('Error loading offline queue:', error);
      this.syncQueue = [];
    }
  }

  // Guardar cola offline en almacenamiento
  private async saveOfflineQueue() {
    try {
      await AsyncStorage.setItem('offline_sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }

  // Mostrar error de sincronización
  private showSyncError(action: OfflineAction) {
    Alert.alert(
      'Error de Sincronización',
      `No se pudo sincronizar la acción: ${action.type} ${action.entityType}`,
      [
        { text: 'OK', style: 'cancel' },
        { text: 'Reintentar', onPress: () => this.retryAction(action) }
      ]
    );
  }

  // Reintentar una acción específica
  private async retryAction(action: OfflineAction) {
    action.retryCount = 0;
    this.syncQueue.push(action);
    await this.saveOfflineQueue();
    
    if (this.isOnline()) {
      this.processOfflineQueue();
    }
  }

  // Obtener estadísticas de la cola offline
  getOfflineStats() {
    return {
      totalPending: this.syncQueue.length,
      byType: this.syncQueue.reduce((acc, action) => {
        acc[action.type] = (acc[action.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byEntity: this.syncQueue.reduce((acc, action) => {
        acc[action.entityType] = (acc[action.entityType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  // Limpiar cola offline (para testing o reset)
  async clearOfflineQueue() {
    this.syncQueue = [];
    await this.saveOfflineQueue();
    console.log('Offline queue cleared');
  }

  // Forzar sincronización
  async forcSync() {
    if (!this.isOnline()) {
      Alert.alert('Sin Conexión', 'No hay conexión a internet disponible');
      return false;
    }

    try {
      await this.processOfflineQueue();
      return true;
    } catch (error) {
      console.error('Error during forced sync:', error);
      Alert.alert('Error', 'Error durante la sincronización forzada');
      return false;
    }
  }
}

export default ConnectivityService;