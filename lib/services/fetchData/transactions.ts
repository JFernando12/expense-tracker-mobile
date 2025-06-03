import { transactionLocalStorage } from "@/lib/storage/transactionLocalStorage";
import { walletLocalStorage } from "@/lib/storage/walletLocalStorage";
import { Transaction } from "@/types/types";
import {
  createTransactionOnServer,
  deleteTransactionFromServer,
  getTransactionsFromServer,
  updateTransactionOnServer,
} from "../../appwrite";

export const createTransaction = async ({
  isOnlineMode,
  data,
}: {
  isOnlineMode: boolean;
  data: Omit<Transaction, 'id' | 'updatedAt'>;
}): Promise<boolean> => {
  console.log('Creating transaction', data);
  const { localId, updatedAt } =
    await transactionLocalStorage.createTransaction(data);

  // Update Wallets' current balance
  await walletLocalStorage.addToBalance({
    id: data.walletId,
    amount: data.amount,
    type: data.type,
  });

  if (!isOnlineMode) return !!localId;

  await createTransactionOnServer({ ...data, id: localId, updatedAt });
  await transactionLocalStorage.updateSyncStatus(localId, 'synced');

  return !!localId;
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
  console.log('Updating transaction', id, data);
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

  const { success, updatedAt } =
    await transactionLocalStorage.updateTransaction({
      id,
      data,
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
  const { success, deletedAt } =
    await transactionLocalStorage.deleteTransaction(id);
  if (!isOnlineMode) return success;

  await deleteTransactionFromServer({ id, deletedAt });
  await transactionLocalStorage.updateSyncStatus(id, 'synced');

  return success;
};

export const getTransactions = async ({
  isOnlineMode,
}: {
  isOnlineMode: boolean;
}): Promise<Transaction[]> => {
  const localTransactions = await transactionLocalStorage.getTransactions();
  if (!isOnlineMode) return localTransactions;

  const serverTransactions = await getTransactionsFromServer();

  const totalTransactions = [...localTransactions];
  for (const serverTransaction of serverTransactions) {
    const existingWallet = totalTransactions.find(
      (wallet) => wallet.id === serverTransaction.id
    );
    if (existingWallet) {
      Object.assign(existingWallet, serverTransaction);
    } else {
      totalTransactions.push(serverTransaction);
    }
  }

  return totalTransactions;
};

export const searchTransactions = async (
  searchQuery: string
): Promise<Transaction[]> => {
  return await transactionLocalStorage.searchTransactions(searchQuery);
};
