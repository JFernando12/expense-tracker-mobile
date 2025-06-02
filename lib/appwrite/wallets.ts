import { Wallet } from '@/types/types';
import { Query } from 'react-native-appwrite';
import { walletLocalStorage } from '../storage/walletLocalStorage';
import { getCurrentUser } from './auth';
import { config, databases } from './client';

// Original server-only functions (used by sync service)
export const createWalletOnServer = async ({
  id,
  name,
  description,
  initialBalance,
}: Omit<Wallet, 'currentBalance'>): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const response = await databases.createDocument(
      config.databaseId,
      config.walletCollectionId,
      id,
      {
        name,
        description,
        initial_balance: initialBalance,
        current_balance: initialBalance,
        user_id: user.$id,
      }
    );

    return !!response.$id;
  } catch (error) {
    console.error('Error creating wallet:', error);
    return false;
  }
};

// Enhanced functions that work offline (using local storage and sync service)
export const createWallet = async ({
  isLocalMode = true,
  data,
}: {
  isLocalMode?: boolean;
  data: Omit<Wallet, 'id' | 'currentBalance'>;
}): Promise<boolean> => {
  const { localId } = await walletLocalStorage.createWallet(data);
  if (isLocalMode) return !!localId;

  await createWalletOnServer({ ...data, id: localId });
  await walletLocalStorage.updateSyncStatus(localId, 'synced');

  return !!localId;
};

export const updateWalletOnServer = async ({
  id,
  data: { name, description, initialBalance },
}: {
  id: string;
  data: Omit<Wallet, 'id' | 'currentBalance'>;
}): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const wallet = await databases.getDocument(
      config.databaseId,
      config.walletCollectionId,
      id
    );
    if (!wallet) return false;

    if (wallet.user_id !== user.$id)
      throw new Error('Unauthorized access to wallet');

    const currentBalance = wallet.current_balance as number;
    const oldInitialBalance = wallet.initial_balance as number;

    const newCurrentBalance =
      currentBalance - oldInitialBalance + initialBalance;

    const response = await databases.updateDocument(
      config.databaseId,
      config.walletCollectionId,
      id,
      {
        name,
        description,
        initial_balance: initialBalance,
        current_balance: newCurrentBalance,
        user_id: user.$id,
      }
    );

    return !!response.$id;
  } catch (error) {
    console.error('Error updating wallet:', error);
    return false;
  }
};

export const updateWallet = async ({
  input: { id, data },
  isLocalMode = true,
}: {
  input: {
    id: string;
    data: Omit<Wallet, 'id' | 'currentBalance'>;
  };
  isLocalMode?: boolean;
}): Promise<boolean> => {
  const result = await walletLocalStorage.updateWallet(id, data);
  if (isLocalMode) return result;

  await updateWalletOnServer({ id, data });
  await walletLocalStorage.updateSyncStatus(id, 'synced');

  return result;
};

export const getWalletsFromServer = async (): Promise<Wallet[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const queries = [
      Query.equal('user_id', user.$id),
      Query.orderDesc('date'),
      Query.isNull('deleted_at'),
      Query.orderDesc('$createdAt'),
    ];

    const response = await databases.listDocuments(
      config.databaseId,
      config.walletCollectionId,
      queries
    );

    return (
      response?.documents?.map((wallet) => ({
        id: wallet.$id as string,
        name: wallet.name as string,
        description: wallet.description as string,
        initialBalance: wallet.initial_balance as number,
        currentBalance: wallet.current_balance as number,
      })) || []
    );
  } catch (error) {
    console.error('Error fetching wallets:', error);
    return [];
  }
};

export const getWallets = async ({
  isLocalMode = true,
}: {
  isLocalMode?: boolean;
} = {}): Promise<Wallet[]> => {
  const localWallets = await walletLocalStorage.getWallets();
  if (isLocalMode) return localWallets;

  const serverWallets = await getWalletsFromServer();

  const totalWallets = [...localWallets];
  for (const serverWallet of serverWallets) {
    const existingWallet = totalWallets.find(
      (wallet) => wallet.id === serverWallet.id
    );
    if (existingWallet) {
      Object.assign(existingWallet, serverWallet);
    } else {
      totalWallets.push(serverWallet);
    }
  }

  return totalWallets;
};

const getWalletFromServer = async (id: string): Promise<Wallet | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const queries = [Query.isNull('deleted_at')];
    const wallet = await databases.getDocument(
      config.databaseId,
      config.walletCollectionId,
      id,
      queries
    );

    if (!wallet || wallet.user_id !== user.$id) return null;

    return {
      id: wallet.$id as string,
      name: wallet.name as string,
      description: wallet.description as string,
      initialBalance: wallet.initial_balance as number,
      currentBalance: wallet.current_balance as number,
    };
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return null;
  }
};

export const getWallet = async (
  id: string,
  isLocalMode = true
): Promise<Wallet | null> => {
  const wallet = await walletLocalStorage.getWallet(id);
  if (isLocalMode) return wallet;

  const serverWallet = await getWalletFromServer(id);
  return serverWallet;
};

export const deleteWalletFromServer = async (id: string): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    // Get the wallet to delete
    const wallet = await databases.getDocument(
      config.databaseId,
      config.walletCollectionId,
      id
    );

    if (!wallet) {
      console.error('Wallet not found');
      return false;
    }

    if (wallet.user_id !== user.$id) {
      console.error('Unauthorized access to wallet');
      return false;
    }

    // Check if wallet has any transactions
    const transactions = await databases.listDocuments(
      config.databaseId,
      config.transactionCollectionId,
      [Query.equal('wallet', id)]
    );

    if (transactions.documents.length > 0) {
      console.error('Cannot delete wallet with existing transactions');
      return false;
    }

    // Mark the wallet as deleted
    await databases.updateDocument(
      config.databaseId,
      config.walletCollectionId,
      id,
      {
        deleted_at: new Date().toISOString(),
      }
    );

    return true;
  } catch (error) {
    console.error('Error deleting wallet:', error);
    return false;
  }
};

export const deleteWallet = async (
  id: string,
  isLocalMode = true
): Promise<boolean> => {
  const result = await walletLocalStorage.deleteWallet(id);
  if (isLocalMode) return result;

  await deleteWalletFromServer(id);
  await walletLocalStorage.updateSyncStatus(id, 'synced');
  return result;
};

export const getTotalBalance = async (): Promise<number> => {
  return await walletLocalStorage.getTotalBalance();
};
