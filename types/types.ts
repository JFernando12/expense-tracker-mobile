export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export interface Transaction {
  id: string;
  walletId: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  date: string;
  description: string | null;
  imageUrl: string | null;
  updatedAt: string;
  deletedAt?: string;
}

export interface Wallet {
  id: string;
  name: string;
  description: string;
  initialBalance: number;
  currentBalance: number;
  updatedAt: string;
  deletedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: TransactionType;
}