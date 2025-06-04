import { Wallet } from '@/types/types';
import { Query } from 'react-native-appwrite';
import { getCurrentUser } from './auth';
import { config, databases } from './client';

export const upsertWalletOnServer = async ({
  id,
  name,
  description,
  initialBalance,
  currentBalance,
  updatedAt,
}: Wallet): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    // Create or update the transaction
    const walletData: any = {
      name,
      description,
      initial_balance: initialBalance,
      current_balance: currentBalance,
      user_id: user.$id,
      updated_at: updatedAt,
    };

    // Check if the wallet already exists
    const existingWallet = await databases
      .getDocument(config.databaseId, config.walletCollectionId, id)
      .catch(() => null);

    if (existingWallet) {
      // Update existing wallet
      await databases.updateDocument(
        config.databaseId,
        config.walletCollectionId,
        id,
        walletData
      );
    } else {
      // Create new wallet
      await databases.createDocument(
        config.databaseId,
        config.walletCollectionId,
        id,
        walletData
      );
    }

    return true;
  } catch (error) {
    console.error('Error upserting wallets:', error);
    return false;
  }
};

export const createWalletOnServer = async ({
  id,
  name,
  description,
  initialBalance,
  currentBalance,
  updatedAt,
}: Wallet): Promise<boolean> => {
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
        current_balance: currentBalance,
        user_id: user.$id,
        updated_at: updatedAt,
      }
    );

    return !!response.$id;
  } catch (error) {
    console.error('Error creating wallet:', error);
    return false;
  }
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

export const getWalletsFromServer = async (): Promise<Wallet[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const queries = [
      Query.equal('user_id', user.$id),
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
        updatedAt: wallet.updated_at as string,
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

export const deleteWalletFromServer = async ({
  id,
  updatedAt,
  deletedAt,
}: {
  id: string;
  updatedAt: string;
  deletedAt: string;
}): Promise<boolean> => {
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
        deleted_at: deletedAt,
        updated_at: updatedAt,
      }
    );

    return true;
  } catch (error) {
    console.error('Error deleting wallet:', error);
    return false;
  }
};
