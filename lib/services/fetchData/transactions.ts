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
import { getUser } from '../user/user';

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

  const user = await getUser();
  if (!user.id) return false;

  const result = await createTransactionOnServer({
    userId: user.id,
    transaction: { ...data, id, updatedAt },
  });
  if (!result) return false;
  await transactionLocalStorage.updateSyncStatus(id, 'synced');

  return success;
};

export const updateTransaction = async ({
  input: { transactionId, data, removeImage },
  isOnlineMode,
}: {
  input: {
    transactionId: string;
    data: Omit<Transaction, 'id' | 'updatedAt'>;
    removeImage: boolean;
  };
  isOnlineMode: boolean;
}): Promise<boolean> => {
  const updatedAt = new Date().toISOString();
  const oldTransaction = await transactionLocalStorage.getTransaction(
    transactionId
  );
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
    id: transactionId,
    data: { ...data, updatedAt },
    removeImage,
  });

  if (!isOnlineMode) return success;

  const user = await getUser();
  if (!user.id) {
    console.error('User not found, cannot update transaction');
    return false;
  }

  await updateTransactionOnServer({
    userId: user.id,
    transactionId,
    data: { ...data, updatedAt },
    removeImage,
  });
  await transactionLocalStorage.updateSyncStatus(transactionId, 'synced');
  await walletLocalStorage.updateSyncStatus(data.walletId, 'synced');

  return success;
};

export const deleteTransaction = async ({
  transactionId,
  isOnlineMode,
}: {
  transactionId: string;
  isOnlineMode: boolean;
}): Promise<boolean> => {
  const user = await getUser();
  if (!user.id) {
    console.error('User not found, cannot delete transaction');
    return false;
  }

  const deletedAt = new Date().toISOString();
  const updatedAt = new Date().toISOString();

  const transaction = await transactionLocalStorage.getTransaction(
    transactionId
  );
  if (!transaction) {
    console.error('Transaction not found, cannot delete');
    return false;
  }

  // Revert transaction amount from wallet balance
  await walletLocalStorage.addToBalance({
    id: transaction.walletId,
    amount: -transaction.amount,
    type: transaction.type,
  });

  const { success } = await transactionLocalStorage.deleteTransaction({
    id: transactionId,
    deletedAt,
    updatedAt,
  });
  if (!isOnlineMode) return success;

  await deleteTransactionFromServer({
    userId: user.id,
    transactionId,
    deletedAt,
    updatedAt,
  });
  await transactionLocalStorage.updateSyncStatus(transactionId, 'synced');
  await walletLocalStorage.updateSyncStatus(transaction.walletId, 'synced');

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
