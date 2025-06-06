import { Query } from "react-native-appwrite";
import { config, databases } from "./client";

export interface UserDB {
    userId: string;
    name: string;
    email: string;
    appMode: 'free' | 'premium';
    subscriptionType?: 'monthly' | 'yearly';
    subscriptionExpiration?: Date; // Optional, can be null for free users
}

export const createUser = async ({
    userId,
    name,
    email,
    appMode,
    subscriptionType,
}: {
    userId: string;
    name: string;
    email: string;
    appMode: 'free' | 'premium';
    subscriptionType: 'monthly' | 'yearly';
}): Promise<boolean> => {
    try {
      // Getting subscription expires date
      let subscriptionExpiry: Date | null = null;
      if (appMode === 'premium' && subscriptionType) {
        subscriptionExpiry = new Date();
        if (subscriptionType === 'monthly') {
          subscriptionExpiry.setMonth(subscriptionExpiry.getMonth() + 1);
        } else if (subscriptionType === 'yearly') {
          subscriptionExpiry.setFullYear(subscriptionExpiry.getFullYear() + 1);
        }
      }

      const user = {
        user_id: userId,
        name,
        email,
        app_mode: appMode,
        subscription_type: subscriptionType,
        subscription_expiry: subscriptionExpiry ? subscriptionExpiry.toISOString() : null,
      }

      const response = await databases.createDocument(
        config.databaseId,
        config.userCollectionId,
        userId,
        user
      );
      if (!response.$id) return false;
      return true;
    } catch (error) {
      console.error("Error creating user:", error);
      return false;
    }
};

export const getUser = async (userId: string): Promise<UserDB | null> => {
    try {
      // Get document by user_id (it is not the same as $id)
      console.log("Fetching user with ID:", userId);
      const response = await databases.listDocuments(
        config.databaseId,
        config.userCollectionId,
        [Query.equal('user_id', userId)],
      );
      if (response.documents.length === 0) {
        return null; // User not found
      }
      const userData = response.documents[0];
      return {
        userId: userData.user_id,
        name: userData.name,
        email: userData.email,
        appMode: userData.app_mode,
        subscriptionType: userData.subscription_type,
        subscriptionExpiration: userData.subscription_expiry ? new Date(userData.subscription_expiry) : null,
      } as UserDB;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
};

export const updateUser = async ({
    id,
    name,
    email,
    appMode,
    subscriptionType,
    subscriptionExpiration,
}: {
    id: string;
    name?: string;
    email?: string;
    appMode?: 'free' | 'premium';
    subscriptionType?: 'monthly' | 'yearly';
    subscriptionExpiration?: Date | null;
}): Promise<boolean> => {
    try {
      const userUpdate: any = {};
      if (name) userUpdate.name = name;
      if (email) userUpdate.email = email;
      if (appMode) userUpdate.app_mode = appMode;
      if (subscriptionType) userUpdate.subscription_type = subscriptionType;
      if (subscriptionExpiration) {
        userUpdate.subscription_expiration = subscriptionExpiration.toISOString();
      }

      await databases.updateDocument(
        config.databaseId,
        config.userCollectionId,
        id,
        userUpdate
      );
      return true;
    } catch (error) {
      console.error("Error updating user:", error);
      return false;
    }
}