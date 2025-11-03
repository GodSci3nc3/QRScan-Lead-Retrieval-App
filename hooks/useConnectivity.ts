// =================================================================
// Hook de Conectividad - QRScanLDA
// =================================================================

import ConnectivityService, { ConnectivityState } from '@/services/connectivityService';
import { useEffect, useState } from 'react';

export const useConnectivity = () => {
  const [connectionState, setConnectionState] = useState<ConnectivityState>({
    isConnected: false,
    connectionType: 'unknown',
    isInternetReachable: null
  });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let removeListener: (() => void) | null = null;

    const initializeService = async () => {
      try {
        const service = ConnectivityService.getInstance();
        await service.initialize();
        
        // Obtener estado inicial
        setConnectionState(service.getCurrentState());
        
        // Agregar listener para cambios
        removeListener = service.addListener((newState) => {
          setConnectionState(newState);
        });
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing connectivity service:', error);
      }
    };

    initializeService();

    return () => {
      if (removeListener) {
        removeListener();
      }
    };
  }, []);

  const isOnline = () => {
    return connectionState.isConnected && connectionState.isInternetReachable !== false;
  };

  const getConnectionType = () => {
    return connectionState.connectionType;
  };

  const forcSync = async () => {
    const service = ConnectivityService.getInstance();
    return await service.forcSync();
  };

  const getOfflineStats = () => {
    const service = ConnectivityService.getInstance();
    return service.getOfflineStats();
  };

  const addOfflineAction = async (action: {
    type: 'CREATE' | 'UPDATE' | 'DELETE';
    entityType: 'prospect' | 'exhibitor' | 'event';
    data: any;
  }) => {
    const service = ConnectivityService.getInstance();
    await service.addOfflineAction(action);
  };

  return {
    connectionState,
    isInitialized,
    isOnline: isOnline(),
    connectionType: getConnectionType(),
    forcSync,
    getOfflineStats,
    addOfflineAction
  };
};

export default useConnectivity;