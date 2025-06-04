import { TransactionType, Wallet } from "@/types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import 'react-native-get-random-values';

const WALLETS_KEY = 'wallets';
export interface StoredWallet extends Wallet {
  syncStatus: 'synced' | 'pending' | 'conflict';
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

  async saveWallets(wallets: StoredWallet[]): Promise<boolean> {
    try {
      await AsyncStorage.setItem(WALLETS_KEY, JSON.stringify(wallets));
      return true;
    } catch (error) {
      console.error('Error saving wallets to storage:', error);
      return false;
    }
  }

  async getWallets(): Promise<Wallet[]> {
    const wallets = await this.getWalletsStorage();
    const walletsNotDeleted = wallets.filter((wallet) => !wallet.deletedAt);

    return walletsNotDeleted.map((wallet) => ({
      id: wallet.id,
      updatedAt: wallet.updatedAt,
      name: wallet.name,
      description: wallet.description,
      initialBalance: wallet.initialBalance,
      currentBalance: wallet.currentBalance,
    }));
  }

  async getWallet({ id }: { id: string }): Promise<Wallet | null> {
    const wallets = await this.getWalletsStorage();
    const wallet = wallets.find((w) => w.id === id);
    if (!wallet) return null;

    return {
      id: wallet.id,
      updatedAt: wallet.updatedAt,
      name: wallet.name,
      description: wallet.description,
      initialBalance: wallet.initialBalance,
      currentBalance: wallet.currentBalance,
    };
  }

  async upsertWallet(wallet: StoredWallet): Promise<void> {
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

  async createWallet(wallet: Wallet): Promise<{ success: boolean }> {
    const storedWallet: StoredWallet = {
      ...wallet,
      syncStatus: 'pending',
    };

    await this.upsertWallet(storedWallet);

    return { success: true };
  }

  async updateWallet({
    id,
    data,
  }: {
    id: string;
    data: Omit<Wallet, 'id'>;
  }): Promise<{ success: boolean }> {
    const storedWallet: StoredWallet = {
      ...data,
      id,
      syncStatus: 'pending',
    };

    await this.upsertWallet(storedWallet);
    return { success: true };
  }

  async deleteWallet({
    id,
    updatedAt,
    deletedAt,
  }: {
    id: string;
    updatedAt: string;
    deletedAt: string;
  }): Promise<{ success: boolean }> {
    const wallets = await this.getWalletsStorage();
    const wallet = wallets.find((w) => w.id === id);
    if (!wallet) return { success: false };
    wallet.deletedAt = deletedAt;
    wallet.updatedAt = updatedAt;
    await this.upsertWallet(wallet);
    return { success: true };
  }

  async getTotalBalance(): Promise<number> {
    const wallets = await this.getWallets();
    console.log('Total wallets:', wallets);
    return wallets.reduce((total, wallet) => total + wallet.currentBalance, 0);
  }

  async addToBalance({
    id,
    amount,
    type,
  }: {
    id: string;
    amount: number;
    type: TransactionType;
  }): Promise<boolean> {
    const wallets = await this.getWalletsStorage();
    const walletIndex = wallets.findIndex((w) => w.id === id);
    if (walletIndex < 0) return false;

    const wallet = wallets[walletIndex];
    const newBalance =
      type === TransactionType.INCOME
        ? wallet.currentBalance + amount
        : wallet.currentBalance - amount;

    wallets[walletIndex].currentBalance = newBalance;
    await this.saveWallets(wallets);
    await this.updateSyncStatus(id, 'pending');
    return true;
  }

  async clearWallets(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(WALLETS_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing wallets from storage:', error);
      return false;
    }
  }
}

export const walletLocalStorage = new WalletLocalStorage();
