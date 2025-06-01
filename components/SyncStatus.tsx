import { networkService } from '@/lib/services/networkService';
import { walletSyncService } from '@/lib/services/walletSyncService';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface SyncStatusProps {
  onManualSync?: () => void;
}

const SyncStatus: React.FC<SyncStatusProps> = ({ onManualSync }) => {
  const [syncStatus, setSyncStatus] = useState({
    lastSync: 0,
    pendingChanges: 0,
    isOnline: true
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSyncStatus();
    
    // Listen for network changes
    const unsubscribe = networkService.onNetworkChange(() => {
      loadSyncStatus();
    });

    return unsubscribe;
  }, []);

  const loadSyncStatus = async () => {
    try {
      const status = await walletSyncService.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Error loading sync status:', error);
    }
  };

  const handleManualSync = async () => {
    if (!syncStatus.isOnline) return;
    
    setIsLoading(true);
    try {
      await walletSyncService.forceSync();
      await loadSyncStatus();
      onManualSync?.();
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatLastSync = (timestamp: number) => {
    if (timestamp === 0) return 'Nunca';
    
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Hace un momento';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours}h`;
    return `Hace ${days}d`;
  };

  const getStatusColor = () => {
    if (!syncStatus.isOnline) return 'bg-red-500';
    if (syncStatus.pendingChanges > 0) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!syncStatus.isOnline) return 'Sin conexión';
    if (syncStatus.pendingChanges > 0) return `${syncStatus.pendingChanges} cambios pendientes`;
    return 'Sincronizado';
  };

  return (
    <View className="bg-primary-300 mx-5 mb-3 p-3 rounded-xl">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className={`w-2 h-2 rounded-full mr-2 ${getStatusColor()}`} />
          <View className="flex-1">
            <Text className="text-white text-sm font-medium">
              {getStatusText()}
            </Text>
            <Text className="text-neutral-300 text-xs">
              Última sincronización: {formatLastSync(syncStatus.lastSync)}
            </Text>
          </View>
        </View>
        
        {syncStatus.isOnline && syncStatus.pendingChanges > 0 && (
          <TouchableOpacity
            onPress={handleManualSync}
            disabled={isLoading}
            className={`px-3 py-1 rounded-md ${
              isLoading ? 'bg-gray-600' : 'bg-accent-200'
            }`}
          >
            <Text className="text-white text-xs font-medium">
              {isLoading ? 'Sincronizando...' : 'Sincronizar'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default SyncStatus;
