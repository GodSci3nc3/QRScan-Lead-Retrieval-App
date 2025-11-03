// =================================================================
// Servicio de Sincronización Supabase - QRScanLDA
// =================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Prospect } from '../types/prospect';
import { ProspectDatabase } from './prospectDatabase';
import { DatabaseProspect, isSupabaseConfigured, supabase } from './supabaseConfig';

export interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingSync: number;
  syncInProgress: boolean;
  syncError: string | null;
}

export interface SyncResult {
  success: boolean;
  uploaded: number;
  downloaded: number;
  conflicts: number;
  errors: string[];
}

class SupabaseSyncService {
  private static instance: SupabaseSyncService;
  private syncInProgress = false;
  private lastSyncTimestamp: Date | null = null;
  private connectionListeners: ((status: SyncStatus) => void)[] = [];

  private constructor() {
    this.initializeNetworkListener();
    this.loadLastSyncTimestamp();
  }

  static getInstance(): SupabaseSyncService {
    if (!SupabaseSyncService.instance) {
      SupabaseSyncService.instance = new SupabaseSyncService();
    }
    return SupabaseSyncService.instance;
  }

  // =================================================================
  // Configuración y estado
  // =================================================================

  private async initializeNetworkListener() {
    NetInfo.addEventListener((state: any) => {
      if (state.isConnected && isSupabaseConfigured()) {
        this.performAutoSync();
      }
      this.notifyListeners();
    });
  }

  private async loadLastSyncTimestamp() {
    try {
      const timestamp = await AsyncStorage.getItem('lastSyncTimestamp');
      this.lastSyncTimestamp = timestamp ? new Date(timestamp) : null;
    } catch (error) {
      console.error('Error loading last sync timestamp:', error);
    }
  }

  private async saveLastSyncTimestamp() {
    try {
      this.lastSyncTimestamp = new Date();
      await AsyncStorage.setItem('lastSyncTimestamp', this.lastSyncTimestamp.toISOString());
    } catch (error) {
      console.error('Error saving last sync timestamp:', error);
    }
  }

  // =================================================================
  // Gestión de listeners
  // =================================================================

  addConnectionListener(listener: (status: SyncStatus) => void) {
    this.connectionListeners.push(listener);
    this.notifyListeners(); // Enviar estado inicial
  }

  removeConnectionListener(listener: (status: SyncStatus) => void) {
    this.connectionListeners = this.connectionListeners.filter(l => l !== listener);
  }

  private async notifyListeners() {
    const status = await this.getSyncStatus();
    this.connectionListeners.forEach(listener => listener(status));
  }

  // =================================================================
  // Estado de sincronización
  // =================================================================

  async getSyncStatus(): Promise<SyncStatus> {
    const netInfo = await NetInfo.fetch();
    const pendingProspects = await this.getPendingSyncCount();

    return {
      isOnline: (netInfo.isConnected || false) && isSupabaseConfigured(),
      lastSync: this.lastSyncTimestamp,
      pendingSync: pendingProspects,
      syncInProgress: this.syncInProgress,
      syncError: null
    };
  }

  private async getPendingSyncCount(): Promise<number> {
    try {
      const prospects = await ProspectDatabase.getAllProspects();
      return prospects.filter(p => 
        !p.synced || 
        (p.lastModified && this.lastSyncTimestamp && new Date(p.lastModified) > this.lastSyncTimestamp)
      ).length;
    } catch (error) {
      console.error('Error getting pending sync count:', error);
      return 0;
    }
  }

  // =================================================================
  // Autenticación con Supabase
  // =================================================================

  async authenticateUser(email: string, password: string): Promise<boolean> {
    try {
      if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured, using local authentication');
        return true; // Fallback a autenticación local
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Supabase auth error:', error);
        return false;
      }

      return !!data.user;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  }

  async signOut(): Promise<void> {
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  // =================================================================
  // Sincronización principal
  // =================================================================

  async performFullSync(force = false): Promise<SyncResult> {
    if (this.syncInProgress && !force) {
      throw new Error('Sync already in progress');
    }

    this.syncInProgress = true;
    this.notifyListeners();

    const result: SyncResult = {
      success: false,
      uploaded: 0,
      downloaded: 0,
      conflicts: 0,
      errors: []
    };

    try {
      if (!isSupabaseConfigured()) {
        result.errors.push('Supabase not configured');
        return result;
      }

      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        result.errors.push('No internet connection');
        return result;
      }

      // 1. Subir cambios locales
      const uploadResult = await this.uploadLocalChanges();
      result.uploaded = uploadResult.uploaded;
      result.errors.push(...uploadResult.errors);

      // 2. Descargar cambios remotos
      const downloadResult = await this.downloadRemoteChanges();
      result.downloaded = downloadResult.downloaded;
      result.conflicts = downloadResult.conflicts;
      result.errors.push(...downloadResult.errors);

      // 3. Guardar timestamp de sincronización
      await this.saveLastSyncTimestamp();

      result.success = result.errors.length === 0;

    } catch (error: any) {
      result.errors.push(`Sync error: ${error?.message || 'Unknown error'}`);
    } finally {
      this.syncInProgress = false;
      this.notifyListeners();
    }

    return result;
  }

  private async performAutoSync() {
    try {
      // Auto-sync solo si han pasado más de 15 minutos
      if (this.lastSyncTimestamp) {
        const timeDiff = Date.now() - this.lastSyncTimestamp.getTime();
        if (timeDiff < 15 * 60 * 1000) { // 15 minutos
          return;
        }
      }

      await this.performFullSync();
    } catch (error) {
      console.log('Auto-sync error (non-critical):', error);
    }
  }

  // =================================================================
  // Upload de cambios locales
  // =================================================================

  private async uploadLocalChanges(): Promise<{ uploaded: number; errors: string[] }> {
    const result = { uploaded: 0, errors: [] as string[] };

    try {
      const localProspects = await ProspectDatabase.getAllProspects();
      const prospectsToUpload = localProspects.filter(p => 
        !p.synced || 
        (p.lastModified && this.lastSyncTimestamp && new Date(p.lastModified) > this.lastSyncTimestamp)
      );

      for (const prospect of prospectsToUpload) {
        try {
          await this.uploadProspect(prospect);
          
          // Marcar como sincronizado
          await ProspectDatabase.updateProspect(prospect.id, { 
            synced: true,
            lastModified: new Date().toISOString()
          });
          
          result.uploaded++;
        } catch (error: any) {
          result.errors.push(`Error uploading prospect ${prospect.fullName || prospect.name}: ${error?.message || 'Unknown error'}`);
        }
      }

    } catch (error: any) {
      result.errors.push(`Error getting local prospects: ${error?.message || 'Unknown error'}`);
    }

    return result;
  }

  private async uploadProspect(prospect: Prospect): Promise<void> {
    const databaseProspect: Omit<DatabaseProspect, 'id' | 'created_at' | 'updated_at'> = {
      exhibitor_id: prospect.exhibitorId || '',
      event_id: prospect.eventId || '',
      full_name: prospect.fullName || prospect.name || '',
      email: prospect.email,
      phone: prospect.phone,
      company: prospect.company,
      position: prospect.position,
      industry: prospect.industry,
      website: prospect.website,
      address: prospect.address,
      lead_source: prospect.leadSource === 'QR Scanner' ? 'qr_scan' : 'manual_entry',
      priority: (prospect.priority?.toLowerCase() as any) || 'medium',
      interest_level: 'warm', // Default
      notes: prospect.notes,
      tags: prospect.tags,
      is_starred: prospect.isStarred || false,
      is_qualified: false,
      qr_data: prospect.qrData ? JSON.parse(prospect.qrData) : null,
      sync_status: 'synced',
      last_interaction: prospect.lastModified
    };

    const { error } = await supabase
      .from('prospects')
      .upsert(databaseProspect, {
        onConflict: 'exhibitor_id,email,event_id'
      });

    if (error) {
      throw new Error(`Supabase upload error: ${error.message}`);
    }
  }

  // =================================================================
  // Download de cambios remotos
  // =================================================================

  private async downloadRemoteChanges(): Promise<{ downloaded: number; conflicts: number; errors: string[] }> {
    const result = { downloaded: 0, conflicts: 0, errors: [] as string[] };

    try {
      const { data: remoteProspects, error } = await supabase
        .from('prospects')
        .select('*')
        .gte('updated_at', this.lastSyncTimestamp?.toISOString() || '1970-01-01');

      if (error) {
        result.errors.push(`Error downloading prospects: ${error.message}`);
        return result;
      }

      for (const remoteProspect of remoteProspects || []) {
        try {
          const localProspect = await this.convertToLocalProspect(remoteProspect);
          
          // Verificar si existe localmente
          const existing = await ProspectDatabase.getProspectById(remoteProspect.id);
          
          if (existing) {
            // Manejar conflicto
            const shouldUpdate = await this.resolveConflict(existing, localProspect);
            if (shouldUpdate) {
              await ProspectDatabase.updateProspect(existing.id, localProspect);
              result.downloaded++;
            } else {
              result.conflicts++;
            }
          } else {
            // Nuevo prospecto
            await ProspectDatabase.addProspect(localProspect);
            result.downloaded++;
          }

        } catch (error: any) {
          result.errors.push(`Error processing remote prospect: ${error?.message || 'Unknown error'}`);
        }
      }

    } catch (error: any) {
      result.errors.push(`Error downloading remote changes: ${error?.message || 'Unknown error'}`);
    }

    return result;
  }

  private async convertToLocalProspect(remote: DatabaseProspect): Promise<Prospect> {
    return {
      id: remote.id,
      fullName: remote.full_name,
      name: remote.full_name,
      email: remote.email || '',
      phone: remote.phone,
      company: remote.company || '',
      position: remote.position || '',
      industry: remote.industry,
      website: remote.website,
      address: remote.address,
      leadSource: remote.lead_source === 'qr_scan' ? 'QR Scanner' : 'Manual Entry',
      priority: remote.priority,
      notes: remote.notes,
      tags: remote.tags,
      isStarred: remote.is_starred,
      qrData: remote.qr_data ? JSON.stringify(remote.qr_data) : undefined,
      createdAt: remote.created_at,
      lastModified: remote.updated_at,
      synced: true,
      exhibitorId: remote.exhibitor_id,
      eventId: remote.event_id
    };
  }

  private async resolveConflict(local: Prospect, remote: Prospect): Promise<boolean> {
    // Estrategia simple: el más reciente gana
    const localDate = new Date(local.lastModified || local.createdAt || 0);
    const remoteDate = new Date(remote.lastModified || remote.createdAt || 0);
    
    return remoteDate > localDate;
  }

  // =================================================================
  // Funciones públicas de utilidad
  // =================================================================

  async forceSyncProspect(prospectId: string): Promise<boolean> {
    try {
      const prospect = await ProspectDatabase.getProspectById(prospectId);
      if (!prospect) return false;

      await this.uploadProspect(prospect);
      await ProspectDatabase.updateProspect(prospectId, { 
        synced: true,
        lastModified: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Error force syncing prospect:', error);
      return false;
    }
  }

  async clearSyncData(): Promise<void> {
    try {
      await AsyncStorage.removeItem('lastSyncTimestamp');
      this.lastSyncTimestamp = null;
      this.notifyListeners();
    } catch (error) {
      console.error('Error clearing sync data:', error);
    }
  }

  // =================================================================
  // Funciones administrativas
  // =================================================================

  async getAdminStats(): Promise<any> {
    try {
      if (!isSupabaseConfigured()) return null;

      const { data, error } = await supabase
        .rpc('get_event_stats', { event_uuid: 'default-event-id' });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting admin stats:', error);
      return null;
    }
  }

  async getExhibitorStats(): Promise<any[]> {
    try {
      if (!isSupabaseConfigured()) return [];

      const { data, error } = await supabase
        .from('prospect_stats_by_exhibitor')
        .select('*')
        .order('total_prospects', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting exhibitor stats:', error);
      return [];
    }
  }
}

// Exportar instancia singleton
export const SyncService = SupabaseSyncService.getInstance();