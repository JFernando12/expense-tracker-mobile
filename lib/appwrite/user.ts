import { Query } from 'react-native-appwrite';
import { User } from '../global-provider';
import { UserLocal } from '../storage/userLocalStorage';
import { login, logout, register } from './auth';
import { config, databases } from './client';

export const createUser = async ({
  userId,
  name,
  email,
}: {
  userId: string;
  name: string;
  email: string;
}): Promise<boolean> => {
  try {
    // Create user document in Appwrite
    await databases.createDocument(
      config.databaseId,
      config.userCollectionId,
      userId, // Use userId as document ID
      {
        user_id: userId,
        name,
        email,
        app_mode: 'free',
        subscription_type: null,
        subscription_expiration: null,
        transaction_id: null,
        original_transaction_id: null,
      }
    );
    return true;
  } catch (error) {
    console.error('Error creating user:', error);
    return false;
  }
};

export const getUser = async (userId: string): Promise<User | null> => {
  try {
    // Get document by user_id (it is not the same as $id)
    const response = await databases.listDocuments(
      config.databaseId,
      config.userCollectionId,
      [Query.equal('user_id', userId)]
    );
    if (response.documents.length === 0) {
      return null; // User not found
    }
    const userData = response.documents[0];
    return {
      id: userData.user_id,
      name: userData.name,
      email: userData.email,
      appMode: userData.app_mode,
      subscriptionType: userData.subscription_type,
      subscriptionExpiration: userData.subscription_expiration,
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

export const updateUserOnServer = async ({
  input: { id, data },
}: {
  input: {
    id: string;
    data: Omit<UserLocal, 'id'>;
  };
}): Promise<boolean> => {
  try {
    const { name, email, appMode, subscriptionType, subscriptionExpiration } =
      data;

    const userUpdate: any = {};
    if (name) userUpdate.name = name;
    if (email) userUpdate.email = email;
    if (appMode) userUpdate.app_mode = appMode;
    if (subscriptionType) userUpdate.subscription_type = subscriptionType;
    if (subscriptionExpiration) {
      userUpdate.subscription_expiration = subscriptionExpiration.toISOString();
    }

    // Update document by user_id (it is not the same as $id)
    const response = await databases.listDocuments(
      config.databaseId,
      config.userCollectionId,
      [Query.equal('user_id', id)]
    );
    if (response.documents.length === 0) {
      console.error('User not found for update:', id);
      return false; // User not found
    }

    const userDocId = response.documents[0].$id;
    await databases.updateDocument(
      config.databaseId,
      config.userCollectionId,
      userDocId,
      userUpdate
    );

    return true;
  } catch (error) {
    console.error('Error updating user:', error);
    return false;
  }
};

export const upgradeToPremiumOnServer = async ({
  input: { userId, subscriptionType, subscriptionExpiration, transactionId, originalTransactionId },
}: {
  input: {
    userId: string;
    subscriptionType: 'monthly' | 'yearly';
    subscriptionExpiration: Date;
    transactionId?: string;
    originalTransactionId?: string;
  };
}): Promise<boolean> => {
  try {
    // Update document by user_id (it is not the same as $id)
    const response = await databases.listDocuments(
      config.databaseId,
      config.userCollectionId,
      [Query.equal('user_id', userId)]
    );
    if (response.documents.length === 0) {
      console.error('User not found for upgrade:', userId);
      return false; // User not found
    }    const userDocId = response.documents[0].$id;
    
    const updateData: any = {
      app_mode: 'premium',
      subscription_type: subscriptionType,
      subscription_expiration: subscriptionExpiration.toISOString(),
    };
    
    // Add transaction data if provided
    if (transactionId) {
      updateData.transaction_id = transactionId;
    }
    if (originalTransactionId) {
      updateData.original_transaction_id = originalTransactionId;
    }
    
    await databases.updateDocument(
      config.databaseId,
      config.userCollectionId,
      userDocId,
      updateData
    );

    return true;
  } catch (error) {
    console.error('Error upgrading user to premium:', error);
    return false;
  }
};

export const loginOnServer = async (
  email: string,
  password: string
): Promise<UserLocal | null> => {
  const id = await login(email, password);
  if (!id) return null;
  const user = await getUser(id);
  return user;
};

export const logoutOnServer = async (): Promise<boolean> => {
  const result = await logout();
  if (!result) return false;
  return true;
};

export const registerOnServer = async ({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name: string;
}): Promise<string | null> => {
  const userId = await register({
    email,
    password,
    name,
  });
  if (!userId) return null;

  const response = await databases.createDocument(
    config.databaseId,
    config.userCollectionId,
    userId,
    {
      user_id: userId,
      name,
      email,
    }
  );
  if (!response.$id) return null;

  // Save user locally
  await loginOnServer(email, password);
  return userId;
};
