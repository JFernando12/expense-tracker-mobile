import { Wallet } from '@/types/types';
import { ID, Query } from 'react-native-appwrite';
import { walletStorage } from '../storage/walletStorage';
import { getCurrentUser } from './auth';
import { config, databases } from './client';

// Original server-only functions (used by sync service)
export const createWalletOnServer = async ({
  name,
  description,
  initialBalance,
}: {
  name: string;
  description: string;
  initialBalance: number;
}): Promise<Wallet | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const response = await databases.createDocument(
      config.databaseId,
      config.walletCollectionId,
      ID.unique(),
      {
        name,
        description,
        initial_balance: initialBalance,
        current_balance: initialBalance,
        user_id: user.$id,
      }
    );

    return {
      id: response.$id as string,
      name: response.name as string,
      description: response.description as string,
      initialBalance: response.initial_balance as number,
      currentBalance: response.current_balance as number,
    };
  } catch (error) {
    console.error('Error creating wallet:', error);
    return null;
  }
};

// Enhanced functions that work offline (using local storage and sync service)
export const createWallet = async ({
  isLocalMode = true,
  data,
}: {
  isLocalMode?: boolean;
  data: {
    name: string;
    description: string;
    initialBalance: number;
  };
}): Promise<boolean> => {
  const walletData = {
    ...data,
    currentBalance: data.initialBalance,
  };

  const result = await walletStorage.createWalletOffline(walletData);

  if (!isLocalMode) {
    await createWalletOnServer(data);
    await walletStorage.upsertWallet(result, true);
  }

  return !!result;
};

export const updateWalletOnServer = async ({
  id,
  name,
  description,
  initialBalance,
}: {
  id: string;
  name: string;
  description: string;
  initialBalance: number;
}) => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const wallet = await databases.getDocument(
      config.databaseId,
      config.walletCollectionId,
      id
    );
    if (!wallet) return null;

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

    return {
      id: response.$id as string,
      name: response.name as string,
      description: response.description as string,
      initialBalance: response.initial_balance as number,
      currentBalance: response.current_balance as number,
    };
  } catch (error) {
    console.error('Error updating wallet:', error);
    return null;
  }
};

export const updateWallet = async ({
  input: { id, data },
  isLocalMode = true,
}: {
  input: {
    id: string;
    data: {
      name: string;
      description: string;
      initialBalance: number;
    };
  };
  isLocalMode?: boolean;
}): Promise<boolean> => {
  const result = await walletStorage.updateWallet(id, {
    ...data,
    currentBalance: data.initialBalance,
  });

  if (!isLocalMode) {
    await updateWalletOnServer({
      id,
      ...data,
    });
    // Update sync status to synced
    const wallets = await walletStorage.getWallets();
    const walletIndex = wallets.findIndex((w) => w.id === id);
    if (walletIndex >= 0) {
      wallets[walletIndex].syncStatus = 'synced';
      await walletStorage.saveWallets(wallets);
    }
  }

  return true;
};

export const getWalletsFromServer = async (): Promise<Wallet[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const response = await databases.listDocuments(
      config.databaseId,
      config.walletCollectionId,
      [Query.equal('user_id', user.$id)]
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
  const localWallets = await walletStorage.getWallets();
  return localWallets.map((wallet) => ({
    id: wallet.id,
    name: wallet.name,
    description: wallet.description,
    initialBalance: wallet.initialBalance,
    currentBalance: wallet.currentBalance,
  }));
};

export const getWallet = async (
  id: string,
  isLocalMode = true
): Promise<Wallet | null> => {
  const wallet = await walletStorage.getWallet(id);
  if (!wallet) return null;

  return {
    id: wallet.id,
    name: wallet.name,
    description: wallet.description,
    initialBalance: wallet.initialBalance,
    currentBalance: wallet.currentBalance,
  };
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

    // Delete the wallet document
    await databases.deleteDocument(
      config.databaseId,
      config.walletCollectionId,
      id
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
  const result = await walletStorage.deleteWallet(id);

  if (!isLocalMode) {
    await deleteWalletFromServer(id);
    // Remove from pending changes since it's synced
    await walletStorage.removePendingChange(id);
  }

  return true;
};

export const getTotalBalance = async (): Promise<number> => {
  return await walletStorage.getTotalBalance();
};
