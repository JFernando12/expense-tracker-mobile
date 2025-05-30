export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export interface Transaction {
  id: string;
  walletId?: string;
  categoryId?: string;
  category: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  imageUrl?: string;
}

export interface Wallet {
  id: string;
  name: string;
  description: string;
  initialBalance: number;
  currentBalance: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: TransactionType;
}