import { Wallet } from '@/types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const WALLETS_KEY = 'wallets';
const PENDING_CHANGES_KEY = 'pending_wallet_changes';
const LAST_SYNC_KEY = 'last_wallet_sync';

// Pending change types
export interface PendingWalletChange {
  id: string;
  type: 'create' | 'update' | 'delete';
  data?: Partial<Wallet>;
  timestamp: number;
  localId?: string; // For offline-created wallets
}

export interface StoredWallet extends Wallet {
  isLocal?: boolean; // Flag for offline-created wallets
  lastModified: number;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

class WalletStorageService {
  // Get all wallets from local storage
  async getWallets(): Promise<StoredWallet[]> {
    try {
      const walletsJson = await AsyncStorage.getItem(WALLETS_KEY);
      if (!walletsJson) return [];
      return JSON.parse(walletsJson);
    } catch (error) {
      console.error('Error getting wallets from storage:', error);
      return [];
    }
  }

  // Save wallets to local storage
  async saveWallets(wallets: StoredWallet[]): Promise<void> {
    try {
      await AsyncStorage.setItem(WALLETS_KEY, JSON.stringify(wallets));
    } catch (error) {
      console.error('Error saving wallets to storage:', error);
      throw error;
    }
  }

  // Get a single wallet by ID
  async getWallet(id: string): Promise<StoredWallet | null> {
    const wallets = await this.getWallets();
    return wallets.find(wallet => wallet.id === id) || null;
  }

  // Add or update a wallet in local storage
  async upsertWallet(wallet: Wallet, isFromServer = false): Promise<void> {
    const wallets = await this.getWallets();
    const existingIndex = wallets.findIndex(w => w.id === wallet.id);
    
    const storedWallet: StoredWallet = {
      ...wallet,
      lastModified: Date.now(),
      syncStatus: isFromServer ? 'synced' : 'pending',
      isLocal: isFromServer ? false : (wallet.id.startsWith('local_'))
    };

    if (existingIndex >= 0) {
      wallets[existingIndex] = storedWallet;
    } else {
      wallets.push(storedWallet);
    }

    await this.saveWallets(wallets);
  }

  // Create a wallet offline with local ID
  async createWalletOffline(wallet: Omit<Wallet, 'id'>): Promise<StoredWallet> {
    const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const storedWallet: StoredWallet = {
      ...wallet,
      id: localId,
      lastModified: Date.now(),
      syncStatus: 'pending',
      isLocal: true
    };

    await this.upsertWallet(storedWallet);
    
    await this.addPendingChange({
      id: localId,
      type: 'create',
      data: wallet,
      timestamp: Date.now(),
      localId
    });

    return storedWallet;
  }

  // Update a wallet
  async updateWallet(id: string, updates: Partial<Wallet>): Promise<void> {
    const wallets = await this.getWallets();
    const walletIndex = wallets.findIndex(w => w.id === id);
    
    if (walletIndex >= 0) {
      wallets[walletIndex] = {
        ...wallets[walletIndex],
        ...updates,
        lastModified: Date.now(),
        syncStatus: 'pending'
      };
      
      await this.saveWallets(wallets);
      await this.addPendingChange({
        id,
        type: 'update',
        data: updates,
        timestamp: Date.now()
      });
    }
  }

  // Delete a wallet
  async deleteWallet(id: string): Promise<void> {
    const wallets = await this.getWallets();
    const filteredWallets = wallets.filter(w => w.id !== id);
    
    await this.saveWallets(filteredWallets);
    
    // Only add to pending changes if it's not a local-only wallet
    const wallet = wallets.find(w => w.id === id);
    if (wallet && !wallet.isLocal) {
      await this.addPendingChange({
        id,
        type: 'delete',
        timestamp: Date.now()
      });
    }
  }

  // Pending changes management
  async getPendingChanges(): Promise<PendingWalletChange[]> {
    try {
      const changesJson = await AsyncStorage.getItem(PENDING_CHANGES_KEY);
      if (!changesJson) return [];
      return JSON.parse(changesJson);
    } catch (error) {
      console.error('Error getting pending changes:', error);
      return [];
    }
  }

  async addPendingChange(change: PendingWalletChange): Promise<void> {
    try {
      const changes = await this.getPendingChanges();
      
      // Remove any existing change for the same wallet
      const filteredChanges = changes.filter(c => c.id !== change.id);
      filteredChanges.push(change);
      
      await AsyncStorage.setItem(PENDING_CHANGES_KEY, JSON.stringify(filteredChanges));
    } catch (error) {
      console.error('Error adding pending change:', error);
    }
  }

  async removePendingChange(id: string): Promise<void> {
    try {
      const changes = await this.getPendingChanges();
      const filteredChanges = changes.filter(c => c.id !== id);
      await AsyncStorage.setItem(PENDING_CHANGES_KEY, JSON.stringify(filteredChanges));
    } catch (error) {
      console.error('Error removing pending change:', error);
    }
  }

  async clearPendingChanges(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PENDING_CHANGES_KEY);
    } catch (error) {
      console.error('Error clearing pending changes:', error);
    }
  }

  // Sync status management
  async updateLastSyncTime(): Promise<void> {
    try {
      await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error updating last sync time:', error);
    }
  }

  async getLastSyncTime(): Promise<number> {
    try {
      const time = await AsyncStorage.getItem(LAST_SYNC_KEY);
      return time ? parseInt(time) : 0;
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return 0;
    }
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([WALLETS_KEY, PENDING_CHANGES_KEY, LAST_SYNC_KEY]);
    } catch (error) {
      console.error('Error clearing all wallet data:', error);
    }
  }

  async getTotalBalance(): Promise<number> {
    const wallets = await this.getWallets();
    return wallets.reduce((total, wallet) => total + wallet.currentBalance, 0);
  }
}

export const walletStorage = new WalletStorageService();
