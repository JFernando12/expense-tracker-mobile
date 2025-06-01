import { Wallet } from "@/types/types";
import { ID, Query } from "react-native-appwrite";
import { walletSyncService } from "../services/walletSyncService";
import { getCurrentUser } from "./auth";
import { config, databases } from "./client";

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
    console.error("Error creating wallet:", error);
    return null;
  }
};

// Enhanced functions that work offline
export const createWallet = async ({
  name,
  description,
  initialBalance,
}: {
  name: string;
  description: string;
  initialBalance: number;
}): Promise<Wallet | null> => {
  return await walletSyncService.createWallet({
    name,
    description,
    initialBalance,
  });
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
      throw new Error("Unauthorized access to wallet");

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
    console.error("Error updating wallet:", error);
    return null;
  }
};

export const updateWallet = async ({
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
  return await walletSyncService.updateWallet({
    id,
    name,
    description,
    initialBalance,
  });
};

export const getWalletsFromServer = async (): Promise<Wallet[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const response = await databases.listDocuments(
      config.databaseId,
      config.walletCollectionId,
      [Query.equal("user_id", user.$id)]
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
    console.error("Error fetching wallets:", error);
    return [];
  }
};

export const getWallets = async (): Promise<Wallet[]> => {
  return await walletSyncService.getWallets();
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
      console.error("Wallet not found");
      return false;
    }

    if (wallet.user_id !== user.$id) {
      console.error("Unauthorized access to wallet");
      return false;
    }

    // Check if wallet has any transactions
    const transactions = await databases.listDocuments(
      config.databaseId,
      config.transactionCollectionId,
      [Query.equal("wallet", id)]
    );

    if (transactions.documents.length > 0) {
      console.error("Cannot delete wallet with existing transactions");
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
    console.error("Error deleting wallet:", error);
    return false;
  }
};

export const deleteWallet = async (id: string): Promise<boolean> => {
  return await walletSyncService.deleteWallet(id);
};

export const getTotalBalance = async (): Promise<number> => {
  return await walletSyncService.getTotalBalance();
};
