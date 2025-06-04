import { transactionLocalStorage } from "@/lib/storage/transactionLocalStorage";
import { walletLocalStorage } from "@/lib/storage/walletLocalStorage";
import { Transaction } from "@/types/types";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import {
  createTransactionOnServer,
  deleteTransactionFromServer,
  updateTransactionOnServer,
} from '../../appwrite';

export const createTransaction = async ({
  isOnlineMode,
  data,
}: {
  isOnlineMode: boolean;
  data: Omit<Transaction, 'id' | 'updatedAt'>;
}): Promise<boolean> => {
  const id = uuidv4();
  const updatedAt = new Date().toISOString();

  const { success } = await transactionLocalStorage.createTransaction({
    ...data,
    id,
    updatedAt,
  });

  // Update Wallets' current balance
  await walletLocalStorage.addToBalance({
    id: data.walletId,
    amount: data.amount,
    type: data.type,
  });

  if (!isOnlineMode) return success;

  await createTransactionOnServer({ ...data, id, updatedAt });
  await transactionLocalStorage.updateSyncStatus(id, 'synced');

  return success;
};

export const updateTransaction = async ({
  input: { id, data, removeImage },
  isOnlineMode,
}: {
  input: {
    id: string;
    data: Omit<Transaction, 'id' | 'updatedAt'>;
    removeImage: boolean;
  };
  isOnlineMode: boolean;
}): Promise<boolean> => {
  const updatedAt = new Date().toISOString();
  const oldTransaction = await transactionLocalStorage.getTransaction(id);
  if (!oldTransaction) return false;

  // Revert old transaction amount from wallet balance
  await walletLocalStorage.addToBalance({
    id: oldTransaction.walletId,
    amount: -oldTransaction.amount,
    type: oldTransaction.type,
  });

  // Update new transaction amount in wallet balance
  await walletLocalStorage.addToBalance({
    id: data.walletId,
    amount: data.amount,
    type: data.type,
  });

  const { success } = await transactionLocalStorage.updateTransaction({
    id,
    data: { ...data, updatedAt },
    removeImage,
  });

  if (!isOnlineMode) return success;

  await updateTransactionOnServer({
    id,
    data: { ...data, updatedAt },
    removeImage,
  });
  await transactionLocalStorage.updateSyncStatus(id, 'synced');

  return success;
};

export const deleteTransaction = async ({
  id,
  isOnlineMode,
}: {
  id: string;
  isOnlineMode: boolean;
}): Promise<boolean> => {
  const deletedAt = new Date().toISOString();
  const updatedAt = new Date().toISOString();
  const { success } = await transactionLocalStorage.deleteTransaction({
    id,
    deletedAt,
    updatedAt,
  });
  if (!isOnlineMode) return success;

  await deleteTransactionFromServer({ id, deletedAt, updatedAt });
  await transactionLocalStorage.updateSyncStatus(id, 'synced');

  return success;
};

export const getTransactions = async (): Promise<Transaction[]> => {
  const localTransactions = await transactionLocalStorage.getTransactions();
  return localTransactions;
};

export const searchTransactions = async (
  searchQuery: string
): Promise<Transaction[]> => {
  return await transactionLocalStorage.searchTransactions(searchQuery);
};
