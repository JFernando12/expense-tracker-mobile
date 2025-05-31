import { Transaction, TransactionType } from "@/types/types";
import { ID, Query } from "react-native-appwrite";
import { getCurrentUser } from "./auth";
import { config, databases, storage } from "./client";
import { deleteImage, uploadImage } from "./storage";

export const createTransaction = async ({
  walletId,
  categoryId,
  description,
  amount,
  type,
  date,
  imageUri,
}: {
  walletId: string;
  categoryId: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: Date;
  imageUri?: string;
}): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    // Upload image if provided
    let imageId: string | null = null;
    if (imageUri) {
      imageId = await uploadImage(imageUri);
    }

    // Get the current wallet to update its balance
    const wallet = await databases.getDocument(
      config.databaseId,
      config.walletCollectionId,
      walletId
    );

    if (!wallet) {
      console.error("Wallet not found");
      return false;
    }

    if (wallet.user_id !== user.$id) {
      console.error("Unauthorized access to wallet");
      return false;
    }

    // Create the transaction
    const transactionData: any = {
      wallet: walletId,
      category: categoryId,
      description,
      amount,
      type,
      date: date.toISOString(),
      user_id: user.$id,
    };

    // Add image URL if available
    if (imageId) {
      transactionData.image = imageId;
    }

    const response = await databases.createDocument(
      config.databaseId,
      config.transactionCollectionId,
      ID.unique(),
      transactionData
    );

    if (!response.$id) return false;

    // Update wallet balance
    const currentBalance = wallet.current_balance as number;
    const newBalance =
      type === "income" ? currentBalance + amount : currentBalance - amount;

    await databases.updateDocument(
      config.databaseId,
      config.walletCollectionId,
      walletId,
      {
        current_balance: newBalance,
      }
    );

    return true;
  } catch (error) {
    console.error("Error creating transaction:", error);
    return false;
  }
};

export const updateTransaction = async ({
  id,
  walletId,
  categoryId,
  description,
  amount,
  type,
  date,
  imageUri,
  removeImage,
}: {
  id: string;
  walletId: string;
  categoryId: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: Date;
  imageUri?: string;
  removeImage?: boolean;
}): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    // Get the current transaction to check ownership
    const transaction = await databases.getDocument(
      config.databaseId,
      config.transactionCollectionId,
      id
    );

    if (!transaction) {
      console.error("Transaction not found");
      return false;
    }

    if (transaction.user_id !== user.$id) {
      console.error("Unauthorized access to transaction");
      return false;
    }

    // Handle image upload/deletion
    let imageId = transaction.image as string | null;

    let currentImageUri: string | undefined;
    if (imageId) {
      currentImageUri = storage
        .getFileView(config.storageBucketId, imageId)
        .toString();
    }

    if (imageUri && imageUri !== currentImageUri) {
      const newImageId = await uploadImage(imageUri);
      imageId = newImageId;
    }

    if (removeImage && imageId) {
      await deleteImage(transaction.image as string);
      if (!imageUri) {
        imageId = null;
      }
    }

    const oldWalletId = transaction.wallet.$id as string;
    const oldAmount = transaction.amount as number;
    const oldType = transaction.type as TransactionType;

    // Get the old wallet (where the transaction was originally recorded)
    const oldWallet = await databases.getDocument(
      config.databaseId,
      config.walletCollectionId,
      oldWalletId
    );

    if (!oldWallet) {
      console.error("Old wallet not found");
      return false;
    }

    if (oldWallet.user_id !== user.$id) {
      console.error("Unauthorized access to old wallet");
      return false;
    }

    // Get the new wallet (where the transaction will be moved to)
    const newWallet = await databases.getDocument(
      config.databaseId,
      config.walletCollectionId,
      walletId
    );

    if (!newWallet) {
      console.error("New wallet not found");
      return false;
    }

    if (newWallet.user_id !== user.$id) {
      console.error("Unauthorized access to new wallet");
      return false;
    }

    // Update the transaction
    const updateData: any = {
      wallet: walletId,
      category: categoryId,
      description,
      amount,
      type,
      date: date.toISOString(),
      image: imageId,
      user_id: user.$id,
    };

    const response = await databases.updateDocument(
      config.databaseId,
      config.transactionCollectionId,
      id,
      updateData
    );

    if (!response.$id) return false;

    // Update wallet balances
    if (oldWalletId === walletId) {
      // Same wallet - just update the balance difference
      const currentBalance = newWallet.current_balance as number;

      // Revert old transaction effect
      const balanceAfterRevert =
        oldType === "income"
          ? currentBalance - oldAmount
          : currentBalance + oldAmount;

      // Apply new transaction effect
      const newBalance =
        type === "income"
          ? balanceAfterRevert + amount
          : balanceAfterRevert - amount;

      await databases.updateDocument(
        config.databaseId,
        config.walletCollectionId,
        walletId,
        {
          current_balance: newBalance,
        }
      );
    } else {
      // Different wallets - revert from old wallet and apply to new wallet

      // Revert the old transaction from the old wallet
      const oldWalletBalance = oldWallet.current_balance as number;
      const oldWalletNewBalance =
        oldType === "income"
          ? oldWalletBalance - oldAmount
          : oldWalletBalance + oldAmount;

      await databases.updateDocument(
        config.databaseId,
        config.walletCollectionId,
        oldWalletId,
        {
          current_balance: oldWalletNewBalance,
        }
      );

      // Apply the new transaction to the new wallet
      const newWalletBalance = newWallet.current_balance as number;
      const newWalletNewBalance =
        type === "income"
          ? newWalletBalance + amount
          : newWalletBalance - amount;

      await databases.updateDocument(
        config.databaseId,
        config.walletCollectionId,
        walletId,
        {
          current_balance: newWalletNewBalance,
        }
      );
    }

    return true;
  } catch (error) {
    console.error("Error updating transaction:", error);
    return false;
  }
};

export const deleteTransaction = async (id: string): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    // Get the transaction to delete
    const transaction = await databases.getDocument(
      config.databaseId,
      config.transactionCollectionId,
      id
    );

    if (!transaction) {
      console.error("Transaction not found");
      return false;
    }

    if (transaction.user_id !== user.$id) {
      console.error("Unauthorized access to transaction");
      return false;
    }

    // Get the wallet to update its balance
    const walletId = transaction.wallet.$id as string;
    const wallet = await databases.getDocument(
      config.databaseId,
      config.walletCollectionId,
      walletId
    );

    if (!wallet) {
      console.error("Wallet not found");
      return false;
    }

    if (wallet.user_id !== user.$id) {
      console.error("Unauthorized access to wallet");
      return false;
    }

    // Delete the image if it exists
    if (transaction.image) {
      await deleteImage(transaction.image as string);
    }

    // Delete the transaction document
    await databases.deleteDocument(
      config.databaseId,
      config.transactionCollectionId,
      id
    );

    // Update wallet balance (revert the transaction)
    const currentBalance = wallet.current_balance as number;
    const amount = transaction.amount as number;
    const type = transaction.type as TransactionType;

    const newBalance =
      type === "income" ? currentBalance - amount : currentBalance + amount;

    await databases.updateDocument(
      config.databaseId,
      config.walletCollectionId,
      walletId,
      {
        current_balance: newBalance,
      }
    );

    return true;
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return false;
  }
};

export const getTransactions = async ({
  type,
}: { type?: TransactionType } = {}): Promise<Transaction[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];
    
    const queries = [Query.equal("user_id", user.$id)];
    if (type) {
      queries.push(Query.equal("type", type));
    }
    queries.push(Query.orderDesc("date"));
    queries.push(Query.orderDesc("$createdAt"));

    const response = await databases.listDocuments(
      config.databaseId,
      config.transactionCollectionId,
      queries
    );

    const transactions =
      (response?.documents?.map((transaction) => {
        const imageUrl = transaction.image
          ? storage
              .getFileView(config.storageBucketId, transaction.image as string)
              .toString()
          : null;

        return {
          id: transaction.$id as string,
          walletId: transaction.wallet.$id as string,
          categoryId: transaction.category.$id as string,
          category: transaction.category.name as string,
          description: transaction.description as string,
          amount: transaction.amount as number,
          type: transaction.type as TransactionType,
          date: new Date(transaction.date).toLocaleDateString(),
          imageUrl,
        };
      }) as Transaction[]) || [];

    return transactions;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
};

export const getTransaction = async (
  id: string
): Promise<Transaction | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const transaction = await databases.getDocument(
      config.databaseId,
      config.transactionCollectionId,
      id
    );

    if (!transaction) return null;

    // Check if user owns this transaction
    if (transaction.user_id !== user.$id) {
      console.error("Unauthorized access to transaction");
      return null;
    }

    const imageUrl = storage.getFileView(
      config.storageBucketId,
      transaction.image as string
    );

    return {
      id: transaction.$id as string,
      walletId: transaction.wallet as string,
      categoryId: transaction.category.$id as string,
      category: transaction.category.name as string,
      description: transaction.description as string,
      amount: transaction.amount as number,
      type: transaction.type as TransactionType,
      date: new Date(transaction.date).toLocaleDateString(),
      imageUrl: imageUrl.toString(),
    };
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return null;
  }
};

export const getTotalIncomes = async (): Promise<number> => {
  try {
    const user = await getCurrentUser();
    if (!user) return 0;

    const transactions = await getTransactions({
      type: TransactionType.INCOME,
    });
    const totalIncome = transactions.reduce(
      (acc, transaction) => acc + transaction.amount,
      0
    );

    return totalIncome;
  } catch (error) {
    console.error("Error fetching total income:", error);
    return 0;
  }
};

export const getTotalExpenses = async (): Promise<number> => {
  try {
    const user = await getCurrentUser();
    if (!user) return 0;

    const transactions = await getTransactions({
      type: TransactionType.EXPENSE,
    });
    const totalExpenses = transactions.reduce(
      (acc, transaction) => acc + transaction.amount,
      0
    );

    return totalExpenses;
  } catch (error) {
    console.error("Error fetching total expenses:", error);
    return 0;
  }
};

export const searchTransactions = async (
  searchQuery: string
): Promise<Transaction[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    if (!searchQuery.trim()) {
      return await getTransactions();
    }

    // Get all user's transactions first
    const response = await databases.listDocuments(
      config.databaseId,
      config.transactionCollectionId,
      [Query.equal("user_id", user.$id)]
    );

    // Filter transactions based on search query
    const searchLower = searchQuery.toLowerCase();
    const filteredTransactions =
      response?.documents?.filter((transaction) => {
        const description =
          (transaction.description as string)?.toLowerCase() || "";
        const category =
          (transaction.category?.name as string)?.toLowerCase() || "";
        const amount = (transaction.amount as number)?.toString() || "";

        return (
          description.includes(searchLower) ||
          category.includes(searchLower) ||
          amount.includes(searchLower)
        );
      }) || [];
    return filteredTransactions.map((transaction) => ({
      id: transaction.$id as string,
      walletId: transaction.wallet.$id as string,
      categoryId: transaction.category.$id as string,
      category: transaction.category.name as string,
      description: transaction.description as string,
      amount: transaction.amount as number,
      type: transaction.type as TransactionType,
      date: new Date(transaction.date).toLocaleDateString(),
      imageUrl: transaction.image as string,
    }));
  } catch (error) {
    console.error("Error searching transactions:", error);
    return [];
  }
};
