import { Transaction, TransactionType } from "@/types/types";
import { Query } from "react-native-appwrite";
import { getCurrentUser } from "./auth";
import { config, databases, storage } from "./client";
import { deleteImage, uploadImage } from "./storage";

export const getTransactionsFromServer = async (filters?: {
  type?: TransactionType;
}): Promise<Transaction[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const queries = [
      Query.equal('user_id', user.$id),
      Query.orderDesc('date'),
      Query.isNull('deleted_at'),
      Query.orderDesc('$createdAt'),
    ];

    if (filters?.type) {
      queries.push(Query.equal('type', filters.type));
    }

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
          categoryId: transaction.category as string,
          description: transaction.description as string,
          amount: transaction.amount as number,
          type: transaction.type as TransactionType,
          date: new Date(transaction.date).toLocaleDateString('en-GB'),
          imageUrl,
        };
      }) as Transaction[]) || [];

    return transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

export const upsertTransactionOnServer = async ({
  id,
  walletId,
  categoryId,
  description,
  amount,
  type,
  date,
  imageUrl,
}: Transaction): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    // Upload image if provided
    let imageId: string | null = null;
    if (imageUrl) {
      imageId = await uploadImage(imageUrl);
    }

    // Create or update the transaction
    const transactionData: any = {
      wallet: walletId,
      category: categoryId,
      description,
      amount,
      type,
      date: date,
      user_id: user.$id,
    };

    // Add image URL if available
    if (imageId) {
      transactionData.image = imageId;
    }

    // Check if the transaction already exists
    const existingTransaction = await databases
      .getDocument(config.databaseId, config.transactionCollectionId, id)
      .catch(() => null);
    if (existingTransaction) {
      // Update existing transaction
      await databases.updateDocument(
        config.databaseId,
        config.transactionCollectionId,
        id,
        transactionData
      );
    } else {
      // Create new transaction
      await databases.createDocument(
        config.databaseId,
        config.transactionCollectionId,
        id,
        transactionData
      );
    }

    return true;
  } catch (error) {
    console.error("Error upserting transaction:", error);
    return false;
  }
};

export const createTransactionOnServer = async ({
  id,
  walletId,
  categoryId,
  description,
  amount,
  type,
  date,
  imageUrl,
  updatedAt,
}: Transaction): Promise<Transaction | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    // Upload image if provided
    let imageId: string | null = null;
    if (imageUrl) {
      imageId = await uploadImage(imageUrl);
    }

    // Get the current wallet to update its balance
    const wallet = await databases.getDocument(
      config.databaseId,
      config.walletCollectionId,
      walletId
    );

    if (!wallet) {
      console.error('Wallet not found');
      return null;
    }

    if (wallet.user_id !== user.$id) {
      console.error('Unauthorized access to wallet');
      return null;
    }

    // Create the transaction
    const transactionData: any = {
      updated_at: updatedAt,
      wallet: walletId,
      category: categoryId,
      description,
      amount,
      type,
      date: date,
      user_id: user.$id,
    };

    // Add image URL if available
    if (imageId) {
      transactionData.image = imageId;
    }

    const response = await databases.createDocument(
      config.databaseId,
      config.transactionCollectionId,
      id,
      transactionData
    );

    if (!response.$id) return null;

    // Update wallet balance
    const currentBalance = wallet.current_balance as number;
    const newBalance =
      type === 'income' ? currentBalance + amount : currentBalance - amount;

    await databases.updateDocument(
      config.databaseId,
      config.walletCollectionId,
      walletId,
      {
        current_balance: newBalance,
      }
    );

    // Return the created transaction
    const createdTransaction = await databases.getDocument(
      config.databaseId,
      config.transactionCollectionId,
      response.$id
    );

    return {
      id: createdTransaction.$id as string,
      updatedAt: createdTransaction.updatedAt as number,
      walletId: createdTransaction.wallet.$id as string,
      categoryId: createdTransaction.category.$id as string,
      description: createdTransaction.description as string,
      amount: createdTransaction.amount as number,
      type: createdTransaction.type as TransactionType,
      date: new Date(createdTransaction.date).toLocaleDateString('en-GB'),
      imageUrl: createdTransaction.image
        ? storage
            .getFileView(
              config.storageBucketId,
              createdTransaction.image as string
            )
            .toString()
        : null,
    };
  } catch (error) {
    console.error('Error creating transaction:', error);
    return null;
  }
};

export const updateTransactionOnServer = async ({
  id,
  data: { walletId, categoryId, description, amount, type, date, imageUrl },
  removeImage,
}: {
  id: string;
  data: Omit<Transaction, 'id'>;
  removeImage?: boolean;
}): Promise<Transaction | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    // Get the current transaction to check ownership
    const transaction = await databases.getDocument(
      config.databaseId,
      config.transactionCollectionId,
      id
    );

    if (!transaction) {
      console.error('Transaction not found');
      return null;
    }

    if (transaction.user_id !== user.$id) {
      console.error('Unauthorized access to transaction');
      return null;
    }

    // Handle image upload/deletion
    let imageId = transaction.image as string | null;

    let currentImageUri: string | undefined;
    if (imageId) {
      currentImageUri = storage
        .getFileView(config.storageBucketId, imageId)
        .toString();
    }

    if (imageUrl && imageUrl !== currentImageUri) {
      const newImageId = await uploadImage(imageUrl);
      imageId = newImageId;
    }

    if (removeImage && imageId) {
      await deleteImage(transaction.image as string);
      if (!imageUrl) {
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
      console.error('Old wallet not found');
      return null;
    }

    if (oldWallet.user_id !== user.$id) {
      console.error('Unauthorized access to old wallet');
      return null;
    }

    // Get the new wallet (where the transaction will be moved to)
    const newWallet = await databases.getDocument(
      config.databaseId,
      config.walletCollectionId,
      walletId
    );

    if (!newWallet) {
      console.error('New wallet not found');
      return null;
    }

    if (newWallet.user_id !== user.$id) {
      console.error('Unauthorized access to new wallet');
      return null;
    }

    // Update the transaction
    const updateData: any = {
      wallet: walletId,
      category: categoryId,
      description,
      amount,
      type,
      date: date,
      image: imageId,
      user_id: user.$id,
    };

    const response = await databases.updateDocument(
      config.databaseId,
      config.transactionCollectionId,
      id,
      updateData
    );

    if (!response.$id) return null;

    // Update wallet balances
    if (oldWalletId === walletId) {
      // Same wallet - just update the balance difference
      const currentBalance = newWallet.current_balance as number;

      // Revert old transaction effect
      const balanceAfterRevert =
        oldType === 'income'
          ? currentBalance - oldAmount
          : currentBalance + oldAmount;

      // Apply new transaction effect
      const newBalance =
        type === 'income'
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
        oldType === 'income'
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
        type === 'income'
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

    // Return the updated transaction
    const updatedTransaction = await databases.getDocument(
      config.databaseId,
      config.transactionCollectionId,
      id
    );

    return {
      id: updatedTransaction.$id as string,
      updatedAt: updatedTransaction.updatedAt as number,
      walletId: updatedTransaction.wallet.$id as string,
      categoryId: updatedTransaction.category.$id as string,
      description: updatedTransaction.description as string,
      amount: updatedTransaction.amount as number,
      type: updatedTransaction.type as TransactionType,
      date: new Date(updatedTransaction.date).toLocaleDateString('en-GB'),
      imageUrl: updatedTransaction.image
        ? storage
            .getFileView(
              config.storageBucketId,
              updatedTransaction.image as string
            )
            .toString()
        : null,
    };
  } catch (error) {
    console.error('Error updating transaction:', error);
    return null;
  }
};

export const deleteTransactionFromServer = async ({
  id,
  deletedAt,
}: {
  id: string;
  deletedAt: number;
}): Promise<boolean> => {
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
      console.error('Transaction not found');
      return false;
    }

    if (transaction.user_id !== user.$id) {
      console.error('Unauthorized access to transaction');
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
      console.error('Wallet not found');
      return false;
    }

    if (wallet.user_id !== user.$id) {
      console.error('Unauthorized access to wallet');
      return false;
    }

    // Delete the image if it exists
    if (transaction.image) {
      await deleteImage(transaction.image as string);
    }

    // Update wallet balance (revert the transaction)
    const currentBalance = wallet.current_balance as number;
    const amount = transaction.amount as number;
    const type = transaction.type as TransactionType;

    const newBalance =
      type === 'income' ? currentBalance - amount : currentBalance + amount;

    await databases.updateDocument(
      config.databaseId,
      config.walletCollectionId,
      walletId,
      {
        current_balance: newBalance,
      }
    );

    // Mark the transaction as deleted
    await databases.updateDocument(
      config.databaseId,
      config.transactionCollectionId,
      id,
      {
        deleted_at: deletedAt,
      }
    );

    return true;
  } catch (error) {
    console.error('Error deleting transaction3:', error);
    return false;
  }
};
