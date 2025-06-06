import { Account, Avatars, Client, Databases, Storage } from 'react-native-appwrite';

export const config = {
  platform: process.env.EXPO_PUBLIC_APPWRITE_PLATFORM!,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
  userCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID!,
  categoryCollectionId: process.env.EXPO_PUBLIC_APPWRITE_CATEGORY_COLLECTION_ID!,
  walletCollectionId: process.env.EXPO_PUBLIC_APPWRITE_WALLET_COLLECTION_ID!,
  transactionCollectionId: process.env.EXPO_PUBLIC_APPWRITE_TRANSACTION_COLLECTION_ID!,
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
