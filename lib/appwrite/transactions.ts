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

export const getTotalIncomes = async ({
  period,
}: { period?: PeriodTypes } = {}): Promise<number> => {
  try {
    const user = await getCurrentUser();
    if (!user) return 0;

    const queries = [
      Query.equal("user_id", user.$id),
      Query.equal("type", TransactionType.INCOME),
    ];

    if (period !== PeriodTypes.ALL_TIME) {
      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      switch (period) {
        case PeriodTypes.WEEKLY:
          // Get current week (Monday to Sunday)
          const currentDay = now.getDay();
          const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // adjust when day is Sunday
          startDate = new Date(now.setDate(diff));
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
          break;

        case PeriodTypes.MONTHLY:
          // Get current month
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          endDate.setHours(23, 59, 59, 999);
          break;

        case PeriodTypes.ANNUAL:
          // Get current year
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31);
          endDate.setHours(23, 59, 59, 999);
          break;

        case PeriodTypes.SEVEN_DAYS:
          // Get last 7 days
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 6);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;

        case PeriodTypes.THIRTY_DAYS:
          // Get last 30 days
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 29);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;

        default:
          // No time filter for unknown period types
          break;
      }

      if (startDate! && endDate!) {
        queries.push(Query.greaterThanEqual("date", startDate.toISOString()));
        queries.push(Query.lessThanEqual("date", endDate.toISOString()));
      }
    }

    const response = await databases.listDocuments(
      config.databaseId,
      config.transactionCollectionId,
      queries
    );

    const totalIncome = response.documents.reduce(
      (acc, transaction: any) => acc + (transaction.amount as number),
      0
    );

    return totalIncome;
  } catch (error) {
    console.error("Error fetching total income:", error);
    return 0;
  }
};

export const getTotalExpenses = async ({
  period,
}: { period?: PeriodTypes } = {}): Promise<number> => {
  try {
    const user = await getCurrentUser();
    if (!user) return 0;

    const queries = [
      Query.equal("user_id", user.$id),
      Query.equal("type", TransactionType.EXPENSE),
    ];

    if (period !== PeriodTypes.ALL_TIME) {
      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      switch (period) {
        case PeriodTypes.WEEKLY:
          // Get current week (Monday to Sunday)
          const currentDay = now.getDay();
          const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // adjust when day is Sunday
          startDate = new Date(now.setDate(diff));
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
          break;

        case PeriodTypes.MONTHLY:
          // Get current month
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          endDate.setHours(23, 59, 59, 999);
          break;

        case PeriodTypes.ANNUAL:
          // Get current year
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31);
          endDate.setHours(23, 59, 59, 999);
          break;

        case PeriodTypes.SEVEN_DAYS:
          // Get last 7 days
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 6);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;

        case PeriodTypes.THIRTY_DAYS:
          // Get last 30 days
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 29);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;

        default:
          // No time filter for unknown period types
          break;
      }

      if (startDate! && endDate!) {
        queries.push(Query.greaterThanEqual("date", startDate.toISOString()));
        queries.push(Query.lessThanEqual("date", endDate.toISOString()));
      }
    }

    const response = await databases.listDocuments(
      config.databaseId,
      config.transactionCollectionId,
      queries
    );

    const totalExpenses = response.documents.reduce(
      (acc, transaction: any) => acc + (transaction.amount as number),
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

export interface CategoryExpenseData {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  percentage: number;
  color: string;
}

export const getExpensesByCategory = async (): Promise<
  CategoryExpenseData[]
> => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    // Get all expense transactions for the user
    const response = await databases.listDocuments(
      config.databaseId,
      config.transactionCollectionId,
      [
        Query.equal("user_id", user.$id),
        Query.equal("type", TransactionType.EXPENSE),
        Query.orderDesc("date"),
      ]
    );

    if (!response?.documents?.length) return [];

    // Group transactions by category and calculate totals
    const categoryTotals = new Map<
      string,
      {
        name: string;
        total: number;
        color: string;
      }
    >();

    let totalExpenses = 0;
    response.documents.forEach((transaction: any) => {
      const categoryId = transaction.category.$id as string;
      const categoryName = transaction.category.name as string;
      const amount = transaction.amount as number;

      // Try to get color from category, fallback to default colors
      let categoryColor = transaction.category.color as string;

      // Default colors for categories if color is not available
      const defaultColors = [
        "#f59e0b",
        "#3b82f6",
        "#ec4899",
        "#8b5cf6",
        "#ef4444",
        "#10b981",
        "#84cc16",
        "#94a3b8",
        "#f97316",
        "#06b6d4",
      ];

      // If no color is set, use default color based on category name or index
      if (!categoryColor) {
        const colorIndex = categoryTotals.size % defaultColors.length;
        categoryColor = defaultColors[colorIndex];
      }

      totalExpenses += amount;

      if (categoryTotals.has(categoryId)) {
        const existing = categoryTotals.get(categoryId)!;
        existing.total += amount;
      } else {
        categoryTotals.set(categoryId, {
          name: categoryName,
          total: amount,
          color: categoryColor,
        });
      }
    });

    // Convert to array and calculate percentages
    const categoryData: CategoryExpenseData[] = Array.from(
      categoryTotals.entries()
    ).map(([categoryId, data]) => ({
      categoryId,
      categoryName: data.name,
      totalAmount: data.total,
      percentage: totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0,
      color: data.color,
    }));

    // Sort by total amount (highest first)
    categoryData.sort((a, b) => b.totalAmount - a.totalAmount);

    return categoryData;
  } catch (error) {
    console.error("Error fetching expenses by category:", error);
    return [];
  }
};

export enum PeriodTypes {
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  ANNUAL = "annual",
  SEVEN_DAYS = "7days",
  THIRTY_DAYS = "30days",
  ALL_TIME = "all_time",
}

export const getExpensesByCategoryWithTimeFilter = async ({
  period,
}: {
  period: PeriodTypes;
}): Promise<CategoryExpenseData[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    // Build queries based on time filter
    const queries = [
      Query.equal("user_id", user.$id),
      Query.equal("type", TransactionType.EXPENSE),
    ];
    if (period !== PeriodTypes.ALL_TIME) {
      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      switch (period) {
        case PeriodTypes.WEEKLY:
          // Get current week (Monday to Sunday)
          const currentDay = now.getDay();
          const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // adjust when day is Sunday
          startDate = new Date(now.setDate(diff));
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
          break;

        case PeriodTypes.MONTHLY:
          // Get current month
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          endDate.setHours(23, 59, 59, 999);
          break;

        case PeriodTypes.ANNUAL:
          // Get current year
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31);
          endDate.setHours(23, 59, 59, 999);
          break;

        case PeriodTypes.SEVEN_DAYS:
          // Get last 7 days
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 6);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;

        case PeriodTypes.THIRTY_DAYS:
          // Get last 30 days
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 29);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;

        default:
          // No time filter for unknown period types
          break;
      }

      if (startDate! && endDate!) {
        queries.push(Query.greaterThanEqual("date", startDate.toISOString()));
        queries.push(Query.lessThanEqual("date", endDate.toISOString()));
      }
    }

    queries.push(Query.orderDesc("date"));

    // Get filtered transactions
    const response = await databases.listDocuments(
      config.databaseId,
      config.transactionCollectionId,
      queries
    );

    if (!response?.documents?.length) return [];

    // Group transactions by category and calculate totals
    const categoryTotals = new Map<
      string,
      {
        name: string;
        total: number;
        color: string;
      }
    >();

    let totalExpenses = 0;

    response.documents.forEach((transaction: any) => {
      const categoryId = transaction.category.$id as string;
      const categoryName = transaction.category.name as string;
      const amount = transaction.amount as number;

      // Try to get color from category, fallback to default colors
      let categoryColor = transaction.category.color as string;

      // Default colors for categories if color is not available
      const defaultColors = [
        "#f59e0b",
        "#3b82f6",
        "#ec4899",
        "#8b5cf6",
        "#ef4444",
        "#10b981",
        "#84cc16",
        "#94a3b8",
        "#f97316",
        "#06b6d4",
      ];

      // If no color is set, use default color based on category name or index
      if (!categoryColor) {
        const colorIndex = categoryTotals.size % defaultColors.length;
        categoryColor = defaultColors[colorIndex];
      }

      totalExpenses += amount;

      if (categoryTotals.has(categoryId)) {
        const existing = categoryTotals.get(categoryId)!;
        existing.total += amount;
      } else {
        categoryTotals.set(categoryId, {
          name: categoryName,
          total: amount,
          color: categoryColor,
        });
      }
    });

    // Convert to array and calculate percentages
    const categoryData: CategoryExpenseData[] = Array.from(
      categoryTotals.entries()
    ).map(([categoryId, data]) => ({
      categoryId,
      categoryName: data.name,
      totalAmount: data.total,
      percentage: totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0,
      color: data.color,
    }));

    // Sort by total amount (highest first)
    categoryData.sort((a, b) => b.totalAmount - a.totalAmount);

    return categoryData;
  } catch (error) {
    console.error(
      "Error fetching expenses by category with time filter:",
      error
    );
    return [];
  }
};
