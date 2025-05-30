import { Category, Transaction, TransactionType, Wallet } from '@/types/types';
import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from 'react-native-appwrite';

export const config = {
  platform: process.env.EXPO_PUBLIC_APPWRITE_PLATFORM!,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
  categoryCollectionId:
    process.env.EXPO_PUBLIC_APPWRITE_CATEGORY_COLLECTION_ID!,
  walletCollectionId: process.env.EXPO_PUBLIC_APPWRITE_WALLET_COLLECTION_ID!,
  transactionCollectionId:
    process.env.EXPO_PUBLIC_APPWRITE_TRANSACTION_COLLECTION_ID!,
  storageBucketId: process.env.EXPO_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!,
};

export const client = new Client();

client
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setPlatform(config.platform);

export const avatar = new Avatars(client);
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const login = async (email: string, password: string) => {
  try {
    await account.createEmailPasswordSession(email, password);
    const user = await account.get();
    if (!user.$id) return false;
    return true;
  } catch (error) {
    console.error('Error during login:', error);
    return false;
  }
};

export const register = async (
  email: string,
  password: string,
  name: string
) => {
  try {
    await account.create(ID.unique(), email, password, name);
    await login(email, password);
    const user = await account.get();
    if (!user.$id) return false;
    return true;
  } catch (error) {
    console.error('Error during registration:', error);
    return false;
  }
};

export const logout = async () => {
  try {
    await account.deleteSession('current');
    return true;
  } catch (error) {
    console.error('Error logging out:', error);
    return false;
  }
};

export const getCurrentUser = async () => {
  try {
    const user = await account.get();
    if (!user.$id) return null;

    const userAvatar = avatar.getInitials(user.name);
    return {
      ...user,
      avatar: userAvatar.toString(),
    };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

export const updateUser = async ({ name }: { name: string }) => {
  try {
    const user = await account.updateName(name);
    if (!user.$id) return null;
    const userAvatar = avatar.getInitials(user.name);
    return {
      ...user,
      avatar: userAvatar.toString(),
    };
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
};

export const createWallet = async ({
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

export const uploadImage = async (imageUri: string): Promise<string | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    // Create a file object compatible with React Native Appwrite
    const file = {
      name: `transaction_${Date.now()}.jpg`,
      type: 'image/jpeg',
      size: 0, // Size will be determined by Appwrite
      uri: imageUri,
    };

    const uploadResponse = await storage.createFile(
      config.storageBucketId,
      ID.unique(),
      file
    );

    if (!uploadResponse.$id) return null;

    return uploadResponse.$id;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

export const deleteImage = async (imageId: string): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    await storage.deleteFile(config.storageBucketId, imageId);
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

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
      console.error('Wallet not found');
      return false;
    }

    if (wallet.user_id !== user.$id) {
      console.error('Unauthorized access to wallet');
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
    }; // Add image URL if available
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
      type === 'income' ? currentBalance + amount : currentBalance - amount;

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
    console.error('Error creating transaction:', error);
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
      console.error('Transaction not found');
      return false;
    }

    if (transaction.user_id !== user.$id) {
      console.error('Unauthorized access to transaction');
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
      console.error('Old wallet not found');
      return false;
    }

    if (oldWallet.user_id !== user.$id) {
      console.error('Unauthorized access to old wallet');
      return false;
    }

    // Get the new wallet (where the transaction will be moved to)
    const newWallet = await databases.getDocument(
      config.databaseId,
      config.walletCollectionId,
      walletId
    );

    if (!newWallet) {
      console.error('New wallet not found');
      return false;
    }

    if (newWallet.user_id !== user.$id) {
      console.error('Unauthorized access to new wallet');
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

    return true;
  } catch (error) {
    console.error('Error updating transaction:', error);
    return false;
  }
};

export const getTransactions = async ({
  type,
}: { type?: TransactionType } = {}): Promise<Transaction[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const queries = [Query.equal('user_id', user.$id)];
    if (type) {
      queries.push(Query.equal('type', type));
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
    console.error('Error fetching transactions:', error);
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
      console.error('Unauthorized access to transaction');
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
    console.error('Error fetching transaction:', error);
    return null;
  }
};

export const getWallets = async (): Promise<Wallet[]> => {
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

export const getCategories = async ({
  type,
}: {
  type: TransactionType;
}): Promise<Category[]> => {
  try {
    const response = await databases.listDocuments(
      config.databaseId,
      config.categoryCollectionId,
      [Query.equal('type', type)]
    );

    return (
      response?.documents?.map((category) => ({
        id: category.$id as string,
        name: category.name as string,
        icon: category.icon as string,
        type: category.type as TransactionType,
      })) || []
    );
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const getTotalBalance = async (): Promise<number> => {
  try {
    const user = await getCurrentUser();
    if (!user) return 0;

    const wallets = await getWallets();
    const totalBalance = wallets.reduce(
      (acc, wallet) => acc + wallet.currentBalance,
      0
    );

    return totalBalance;
  } catch (error) {
    console.error('Error fetching balance:', error);
    return 0;
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
    console.error('Error fetching total income:', error);
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
    console.error('Error fetching total expenses:', error);
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
      [Query.equal('user_id', user.$id)]
    );

    // Filter transactions based on search query
    const searchLower = searchQuery.toLowerCase();
    const filteredTransactions =
      response?.documents?.filter((transaction) => {
        const description =
          (transaction.description as string)?.toLowerCase() || '';
        const category =
          (transaction.category?.name as string)?.toLowerCase() || '';
        const amount = (transaction.amount as number)?.toString() || '';

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
    console.error('Error searching transactions:', error);
    return [];
  }
};
