import { Category, Transaction, TransactionType, Wallet } from '@/types/types';
import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
} from 'react-native-appwrite';

export const config = {
  platform: process.env.EXPO_PUBLIC_APPWRITE_PLATFORM,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
  categoryCollectionId: process.env.EXPO_PUBLIC_APPWRITE_CATEGORY_COLLECTION_ID,
  walletCollectionId: process.env.EXPO_PUBLIC_APPWRITE_WALLET_COLLECTION_ID,
  transactionCollectionId:
    process.env.EXPO_PUBLIC_APPWRITE_TRANSACTION_COLLECTION_ID,
};

export const client = new Client();

client
  .setEndpoint(config.endpoint!)
  .setProject(config.projectId!)
  .setPlatform(config.platform!);

export const avatar = new Avatars(client);
export const account = new Account(client);
export const databases = new Databases(client);

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
  initialBalance
}: {
  name: string;
  description: string;
  initialBalance: number;
}): Promise<Wallet | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const response = await databases.createDocument(
      config.databaseId!,
      config.walletCollectionId!,
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
}

export const updateWallet = async ({
  id,
  name,
  description,
  initialBalance,
}:
{
  id: string;
  name: string;
  description: string;
  initialBalance: number;
}
) => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const wallet = await databases.getDocument(
      config.databaseId!,
      config.walletCollectionId!,
      id
    );
    if (!wallet) return null;

    if (wallet.user_id !== user.$id) throw new Error('Unauthorized access to wallet');

    const currentBalance = wallet.current_balance as number;
    const oldInitialBalance = wallet.initial_balance as number;

    const newCurrentBalance = (currentBalance - oldInitialBalance) + initialBalance;

    const response = await databases.updateDocument(
      config.databaseId!,
      config.walletCollectionId!,
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
}

export const createTransaction = async ({
  walletId,
  categoryId,
  description,
  amount,
  type,
  date,
}: {
  walletId: string;
  categoryId: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: Date;
}): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    // Get the current wallet to update its balance
    const wallet = await databases.getDocument(
      config.databaseId!,
      config.walletCollectionId!,
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
    const response = await databases.createDocument(
      config.databaseId!,
      config.transactionCollectionId!,
      ID.unique(),
      {
        wallet: walletId,
        category: categoryId,
        description,
        amount,
        type,
        date: date.toISOString(),
        user_id: user.$id,
      }
    );

    if (!response.$id) return false;

    // Update wallet balance
    const currentBalance = wallet.current_balance as number;
    const newBalance = type === 'income' 
      ? currentBalance + amount 
      : currentBalance - amount;

    await databases.updateDocument(
      config.databaseId!,
      config.walletCollectionId!,
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
}

export const updateTransaction = async ({
  id,
  walletId,
  categoryId,
  description,
  amount,
  type,
  date,
}: {
  id: string;
  walletId: string;
  categoryId: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: Date;
}): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    // Get the current transaction to check ownership
    const transaction = await databases.getDocument(
      config.databaseId!,
      config.transactionCollectionId!,
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

    // Get the current wallet to update its balance
    const wallet = await databases.getDocument(
      config.databaseId!,
      config.walletCollectionId!,
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

    // Update the transaction
    const response = await databases.updateDocument(
      config.databaseId!,
      config.transactionCollectionId!,
      id,
      {
        wallet: walletId,
        category: categoryId,
        description,
        amount,
        type,
        date: date.toISOString(),
        user_id: user.$id,
      }
    );

    if (!response.$id) return false;    // Update wallet balance
    const currentBalance = wallet.current_balance as number;
    const oldAmount = transaction.amount as number;
    const oldType = transaction.type as TransactionType;
    
    // First, revert the old transaction's effect on the balance
    const balanceAfterRevert = oldType === 'income' 
      ? currentBalance - oldAmount 
      : currentBalance + oldAmount;
    
    // Then apply the new transaction amount
    const newBalance = type === 'income' 
      ? balanceAfterRevert + amount 
      : balanceAfterRevert - amount;

    await databases.updateDocument(
      config.databaseId!,
      config.walletCollectionId!,
      walletId,
      {
        current_balance: newBalance,
      }
    );

    return true;
  } catch (error) {
    console.error('Error updating transaction:', error);
    return false;
  }
}

export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const response = await databases.listDocuments(
      config.databaseId!,
      config.transactionCollectionId!,
      [Query.equal('user_id', user.$id)]
    );    return (
      response?.documents?.map((transaction) => ({
        id: transaction.$id as string,
        walletId: transaction.wallet as string,
        categoryId: transaction.category.$id as string,
        category: transaction.category.name as string,
        description: transaction.description as string,
        amount: transaction.amount as number,
        type: transaction.type as TransactionType,
        date: new Date(transaction.date).toLocaleDateString(),
      })) || []
    );
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

export const getTransaction = async (id: string): Promise<Transaction | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const transaction = await databases.getDocument(
      config.databaseId!,
      config.transactionCollectionId!,
      id
    );

    if (!transaction) return null;

    // Check if user owns this transaction
    if (transaction.user_id !== user.$id) {
      console.error('Unauthorized access to transaction');
      return null;
    }    return {
      id: transaction.$id as string,
      walletId: transaction.wallet as string,
      categoryId: transaction.category.$id as string,
      category: transaction.category.name as string,
      description: transaction.description as string,
      amount: transaction.amount as number,
      type: transaction.type as TransactionType,
      date: new Date(transaction.date).toLocaleDateString(),
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
      config.databaseId!,
      config.walletCollectionId!,
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
      config.databaseId!,
      config.categoryCollectionId!,
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
