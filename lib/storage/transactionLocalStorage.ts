import { PeriodTypes } from "@/constants/interfaces";
import { Transaction, TransactionType } from "@/types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

const TRANSACTIONS_KEY = "transactions";
export interface StoredTransaction extends Transaction {
  syncStatus: "synced" | "pending" | "conflict";
  lastModified: number;
  deleteAt?: number;
}

class TransactionLocalStorage {
  async getTransactionsStorage(): Promise<StoredTransaction[]> {
    try {
      const transactionsJson = await AsyncStorage.getItem(TRANSACTIONS_KEY);
      if (!transactionsJson) return [];
      return JSON.parse(transactionsJson);
    } catch (error) {
      console.error("Error getting wallets from storage:", error);
      return [];
    }
  }

  async getTransaction(id: string): Promise<Transaction | null> {
    const transactions = await this.getTransactionsStorage();
    const transaction = transactions.find((t) => t.id === id);
    if (!transaction || transaction.deleteAt) return null;

    return {
      id: transaction.id,
      walletId: transaction.walletId,
      categoryId: transaction.categoryId,
      amount: transaction.amount,
      type: transaction.type,
      date: new Date(transaction.date).toLocaleDateString("en-GB"),
      description: transaction.description,
      imageUrl: transaction.imageUrl,
    };
  }

  async getTransactions(): Promise<Transaction[]> {
    const transactions = await this.getTransactionsStorage();
    const transactionsNotDeleted = transactions.filter(
      (transaction) => !transaction.deleteAt
    );

    return transactionsNotDeleted.map((transaction) => ({
      id: transaction.id,
      walletId: transaction.walletId,
      categoryId: transaction.categoryId,
      amount: transaction.amount,
      type: transaction.type,
      date: new Date(transaction.date).toLocaleDateString("en-GB"),
      description: transaction.description,
      imageUrl: transaction.imageUrl,
    }));
  }

  async saveTransactions(transactions: StoredTransaction[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        TRANSACTIONS_KEY,
        JSON.stringify(transactions)
      );
    } catch (error) {
      console.error("Error saving transactions to storage:", error);
      throw error;
    }
  }

  async upsertTransaction(transaction: StoredTransaction): Promise<void> {
    const transactions = await this.getTransactionsStorage();
    const existingIndex = transactions.findIndex(
      (t) => t.id === transaction.id
    );

    const storedTransaction: StoredTransaction = {
      ...transaction,
      syncStatus: "pending",
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
    status: "synced" | "pending" | "conflict"
  ): Promise<void> {
    const transactions = await this.getTransactionsStorage();
    const transactionIndex = transactions.findIndex((t) => t.id === id);
    if (transactionIndex >= 0) {
      transactions[transactionIndex].syncStatus = status;
      await this.saveTransactions(transactions);
    }
  }

  async createTransaction(
    transaction: Omit<Transaction, "id">
  ): Promise<{ localId: string }> {
    const localId = uuidv4();
    const storedTransaction: StoredTransaction = {
      ...transaction,
      id: localId,
      syncStatus: "pending",
      lastModified: Date.now(),
    };

    await this.upsertTransaction(storedTransaction);

    return { localId };
  }

  async updateTransaction(
    id: string,
    updates: Omit<Transaction, "id">
  ): Promise<boolean> {
    const storedTransaction: StoredTransaction = {
      ...updates,
      id,
      syncStatus: "pending",
      lastModified: Date.now(),
    };

    await this.upsertTransaction(storedTransaction);
    return true;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const transactions = await this.getTransactionsStorage();
    const transaction = transactions.find((t) => t.id === id);
    if (!transaction) return false;
    transaction.deleteAt = Date.now();
    await this.upsertTransaction(transaction);
    return true;
  }

  async searchTransactions(query: string): Promise<Transaction[]> {
    const transactions = await this.getTransactions();
    const searchLower = query.toLowerCase();

    return transactions.filter(
      (t) =>
        t.description?.toLowerCase().includes(searchLower) ||
        t.categoryId?.toLowerCase().includes(searchLower) ||
        t.amount?.toString().includes(searchLower)
    );
  }

  async getTotalIncome({ period }: { period: PeriodTypes }): Promise<number> {
    const transactions = await this.getTransactions();
    const now = new Date();
    let startDate: Date | null = null;

    switch (period) {
      case PeriodTypes.SEVEN_DAYS:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
        break;
      case PeriodTypes.THIRTY_DAYS:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 29);
        break;
      case PeriodTypes.ALL_TIME:
        startDate = null;
        break;
    }

    const transactionsFiltered = transactions.filter((transaction) => {
      if (transaction.type !== TransactionType.INCOME) {
        return false;
      }

      if (!startDate) {
        return true;
      }

      // Parse the date from DD/MM/YYYY format
      const [day, month, year] = transaction.date.split("/");
      const transactionDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day)
      );

      return transactionDate >= startDate;
    });

    return transactionsFiltered.reduce((total, transaction) => {
      return total + transaction.amount;
    }, 0);
  }

  async getTotalExpenses({ period }: { period: PeriodTypes }): Promise<number> {
    const transactions = await this.getTransactions();
    const now = new Date();
    let startDate: Date | null = null;

    switch (period) {
      case PeriodTypes.SEVEN_DAYS:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
        break;
      case PeriodTypes.THIRTY_DAYS:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 29);
        break;
      case PeriodTypes.ALL_TIME:
        startDate = null;
        break;
    }
   

    const transactionsFiltered = transactions.filter((transaction) => {
      if (transaction.type !== TransactionType.EXPENSE) {
        return false;
      }

      if (!startDate) {
        return true;
      }

      // Parse the date from DD/MM/YYYY format
      const [day, month, year] = transaction.date.split("/");
      const transactionDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day)
      );

      return transactionDate >= startDate;
    });

    return transactionsFiltered.reduce((total, transaction) => {
      return total + transaction.amount;
    }, 0);
  }

  async getExpensesByCategory({
    period,
  }: {
    period: PeriodTypes;
  }): Promise<{ categoryId: string; total: number }[]> {
    const transactions = await this.getTransactions();

    const now = new Date();
    let startDate: Date | null = null;

    switch (period) {
      case PeriodTypes.SEVEN_DAYS:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
        break;
      case PeriodTypes.THIRTY_DAYS:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 29);
        break;
      case PeriodTypes.ALL_TIME:
        startDate = null;
        break;
    }

    const categoryTotals: Record<string, number> = {};
    transactions.forEach((transaction) => {
      if (transaction.type === "expense") {
        let includeTransaction = false;

        if (!startDate) {
          includeTransaction = true;
        } else {
          // Parse the date from DD/MM/YYYY format
          const [day, month, year] = transaction.date.split("/");
          const transactionDate = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day)
          );
          includeTransaction = transactionDate >= startDate;
        }

        if (includeTransaction) {
          if (!categoryTotals[transaction.categoryId]) {
            categoryTotals[transaction.categoryId] = 0;
          }
          categoryTotals[transaction.categoryId] += transaction.amount;
        }
      }
    });

    return Object.entries(categoryTotals).map(([categoryId, total]) => ({
      categoryId,
      total,
    }));
  }

  async clearTransactions(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(TRANSACTIONS_KEY);
      return true;
    } catch (error) {
      console.error("Error clearing transactions from storage:", error);
      return false;
    }
  }
}

export const transactionLocalStorage = new TransactionLocalStorage();
