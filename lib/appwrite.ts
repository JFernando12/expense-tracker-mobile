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
    return false;
  }
};

export const logout = async () => {
  try {
    await account.deleteSession('current');
    return true;
  } catch (error) {
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
    return null;
  }
};

export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const response = await databases.listDocuments(
      config.databaseId!,
      config.transactionCollectionId!,
      [Query.equal('user_id', user.$id)]
    );

    return (
      response?.documents?.map((transaction) => ({
        id: transaction.$id as string,
        name: transaction.name as string,
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
