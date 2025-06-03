import { Wallet } from '@/types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

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
  syncStatus: 'synced' | 'pending' | 'conflict';
  lastModified: number;
  deleteAt?: number;
}

class WalletLocalStorage {
  async getWalletsStorage(): Promise<StoredWallet[]> {
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

  // Get all wallets
  async getWallets(): Promise<Wallet[]> {
    const wallets = await this.getWalletsStorage();
    const walletsNotDeleted = wallets.filter((wallet) => !wallet.deleteAt);

    return walletsNotDeleted.map((wallet) => ({
      id: wallet.id,
      name: wallet.name,
      description: wallet.description,
      initialBalance: wallet.initialBalance,
      currentBalance: wallet.currentBalance,
    }));
  }

  async upsertWallet(
    wallet: Omit<StoredWallet, 'currentBalance'>
  ): Promise<void> {
    const wallets = await this.getWalletsStorage();
    const existingIndex = wallets.findIndex((w) => w.id === wallet.id);

    if (existingIndex >= 0) {
      const oldWallet = wallets[existingIndex];
      const currentBalance =
        oldWallet.currentBalance -
        oldWallet.initialBalance +
        wallet.initialBalance;
      wallets[existingIndex] = {
        ...wallet,
        currentBalance,
      };
    } else {
      wallets.push({
        ...wallet,
        currentBalance: wallet.initialBalance,
      });
    }

    await this.saveWallets(wallets);
  }

  async updateSyncStatus(
    id: string,
    status: 'synced' | 'pending' | 'conflict'
  ): Promise<void> {
    const wallets = await this.getWalletsStorage();
    const walletIndex = wallets.findIndex((t) => t.id === id);
    if (walletIndex >= 0) {
      wallets[walletIndex].syncStatus = status;
      await this.saveWallets(wallets);
    }
  }

  async createWallet(
    wallet: Omit<Wallet, 'id' | 'currentBalance'>
  ): Promise<{ localId: string }> {
    const localId = uuidv4();
    const storedWallet: Omit<StoredWallet, 'currentBalance'> = {
      ...wallet,
      id: localId,
      lastModified: Date.now(),
      syncStatus: 'pending',
    };

    await this.upsertWallet(storedWallet);

    return { localId };
  }

  async updateWallet(
    id: string,
    updates: Omit<Wallet, 'id' | 'currentBalance'>
  ): Promise<boolean> {
    const storedWallet: Omit<StoredWallet, 'currentBalance'> = {
      ...updates,
      id,
      syncStatus: 'pending',
      lastModified: Date.now(),
    };

    await this.upsertWallet(storedWallet);
    return true;
  }

  async deleteWallet(id: string): Promise<boolean> {
    const wallets = await this.getWalletsStorage();
    const wallet = wallets.find((w) => w.id === id);
    if (!wallet) return false;
    wallet.deleteAt = Date.now();
    await this.upsertWallet(wallet);
    return true;
  }

  async getTotalBalance(): Promise<number> {
    const wallets = await this.getWallets();
    return wallets.reduce((total, wallet) => total + wallet.currentBalance, 0);
  }
}

export const walletLocalStorage = new WalletLocalStorage();
