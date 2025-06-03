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
  data: Omit<Transaction, "id">;
}): Promise<boolean> => {
  const { localId } = await transactionLocalStorage.createTransaction(data);
  
  // Update Wallets' current balance
  await walletLocalStorage.addToBalance({
    id: data.walletId,
    amount: data.amount,
    type: data.type,
  });

  if (!isOnlineMode) return !!localId;

  await createTransactionOnServer({ ...data, id: localId });
  await transactionLocalStorage.updateSyncStatus(localId, "synced");

  return !!localId;
};

export const updateTransaction = async ({
  input: { id, data, removeImage = false },
  isOnlineMode,
}: {
  input: { id: string; data: Omit<Transaction, "id">; removeImage?: boolean };
  isOnlineMode: boolean;
}): Promise<boolean> => {
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

  const result = await transactionLocalStorage.updateTransaction(id, data);

  if (!isOnlineMode) return result;

  await updateTransactionOnServer({ id, data, removeImage });
  await transactionLocalStorage.updateSyncStatus(id, "synced");

  return result;
};

export const deleteTransaction = async ({
  id,
  isOnlineMode,
}: {
  id: string;
  isOnlineMode: boolean;
}): Promise<boolean> => {
  const result = await transactionLocalStorage.deleteTransaction(id);
  if (!isOnlineMode) return result;

  await deleteTransactionFromServer(id);
  await transactionLocalStorage.updateSyncStatus(id, "synced");

  return result;
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
