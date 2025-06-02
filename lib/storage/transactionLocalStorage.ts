import { Transaction, TransactionType } from '@/types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

// Storage keys
const TRANSACTIONS_KEY = 'transactions';
const PENDING_CHANGES_KEY = 'pending_transaction_changes';
const LAST_SYNC_KEY = 'last_transaction_sync';

// Pending change types
export interface PendingTransactionChange {
  id: string;
  type: 'create' | 'update' | 'delete';
  data?: Partial<Transaction>;
  timestamp: number;
  localId?: string; // For offline-created transactions
}

export interface StoredTransaction extends Transaction {
  syncStatus: 'synced' | 'pending' | 'conflict';
  lastModified: number;
  deleteAt?: number;
}

class TransactionLocalStorage {
  // Get all transactions from local storage
  async getTransactions(): Promise<StoredTransaction[]> {
    try {
      const transactionsJson = await AsyncStorage.getItem(TRANSACTIONS_KEY);
      if (!transactionsJson) return [];
      return JSON.parse(transactionsJson);
    } catch (error) {
      console.error('Error getting transactions from storage:', error);
      return [];
    }
  }

  // Save transactions to local storage
  async saveTransactions(transactions: StoredTransaction[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        TRANSACTIONS_KEY,
        JSON.stringify(transactions)
      );
    } catch (error) {
      console.error('Error saving transactions to storage:', error);
      throw error;
    }
  }

  // Get a single transaction by ID
  async getTransaction(id: string): Promise<StoredTransaction | null> {
    const transactions = await this.getTransactions();
    return transactions.find((transaction) => transaction.id === id) || null;
  }

  // Add or update a transaction in local storage
  async upsertTransaction(transaction: StoredTransaction): Promise<void> {
    const transactions = await this.getTransactions();
    const existingIndex = transactions.findIndex(
      (t) => t.id === transaction.id
    );

    const storedTransaction: StoredTransaction = {
      ...transaction,
      syncStatus: 'pending',
    };

    if (existingIndex >= 0) {
      transactions[existingIndex] = storedTransaction;
    } else {
      transactions.push(storedTransaction);
    }

    await this.saveTransactions(transactions);
  }

  async updateSyncStatus(
    id: string,
    status: 'synced' | 'pending' | 'conflict'
  ): Promise<void> {
    const transactions = await this.getTransactions();
    const transactionIndex = transactions.findIndex((t) => t.id === id);
    if (transactionIndex >= 0) {
      transactions[transactionIndex].syncStatus = status;
      await this.saveTransactions(transactions);
    }
  }

  async createTransaction(
    transaction: Omit<Transaction, 'id'>
  ): Promise<{ localId: string }> {
    const localId = uuidv4();
    const storedTransaction: StoredTransaction = {
      ...transaction,
      id: localId,
      syncStatus: 'pending',
      lastModified: Date.now(),
    };

    await this.upsertTransaction(storedTransaction);

    return { localId };
  }

  async updateTransaction(
    id: string,
    updates: Omit<Transaction, 'id'>
  ): Promise<boolean> {
    const storedTransaction: StoredTransaction = {
      ...updates,
      id,
      syncStatus: 'pending',
      lastModified: Date.now(),
    };

    await this.upsertTransaction(storedTransaction);
    return true;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const transactions = await this.getTransactions();
    const transaction = transactions.find((t) => t.id === id);
    if (!transaction) return false;
    transaction.deleteAt = Date.now();
    await this.upsertTransaction(transaction);
    return true;
  }

  async getPendingChanges(): Promise<PendingTransactionChange[]> {
    try {
      const changesJson = await AsyncStorage.getItem(PENDING_CHANGES_KEY);
      if (!changesJson) return [];
      return JSON.parse(changesJson);
    } catch (error) {
      console.error('Error getting pending changes:', error);
      return [];
    }
  }

  async addPendingChange(change: PendingTransactionChange): Promise<void> {
    try {
      const changes = await this.getPendingChanges();

      // Remove any existing change for the same transaction
      const filteredChanges = changes.filter((c) => c.id !== change.id);
      filteredChanges.push(change);

      await AsyncStorage.setItem(
        PENDING_CHANGES_KEY,
        JSON.stringify(filteredChanges)
      );
    } catch (error) {
      console.error('Error adding pending change:', error);
    }
  }

  async removePendingChange(id: string): Promise<void> {
    try {
      const changes = await this.getPendingChanges();
      const filteredChanges = changes.filter((c) => c.id !== id);
      await AsyncStorage.setItem(
        PENDING_CHANGES_KEY,
        JSON.stringify(filteredChanges)
      );
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
      await AsyncStorage.multiRemove([
        TRANSACTIONS_KEY,
        PENDING_CHANGES_KEY,
        LAST_SYNC_KEY,
      ]);
    } catch (error) {
      console.error('Error clearing all transaction data:', error);
    }
  }

  // Get transactions by type
  async getTransactionsByType(
    type: TransactionType
  ): Promise<StoredTransaction[]> {
    const transactions = await this.getTransactions();
    return transactions.filter((t) => t.type === type);
  }

  // Get transactions by wallet
  async getTransactionsByWallet(
    walletId: string
  ): Promise<StoredTransaction[]> {
    const transactions = await this.getTransactions();
    return transactions.filter((t) => t.walletId === walletId);
  }

  // Search transactions
  async searchTransactions(query: string): Promise<StoredTransaction[]> {
    const transactions = await this.getTransactions();
    const searchLower = query.toLowerCase();

    return transactions.filter(
      (t) =>
        t.description?.toLowerCase().includes(searchLower) ||
        t.categoryId?.toLowerCase().includes(searchLower) ||
        t.amount?.toString().includes(searchLower)
    );
  }

  // Get total amounts by type
  async getTotalByType(type: TransactionType): Promise<number> {
    const transactions = await this.getTransactionsByType(type);
    return transactions.reduce(
      (total, transaction) => total + transaction.amount,
      0
    );
  }
}

export const transactionLocalStorage = new TransactionLocalStorage();
