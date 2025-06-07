import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppMode = 'free' | 'premium';
export type SyncMode = 'local' | 'cloud';

export interface UserLocal {
  id?: string;
  name?: string;
  email?: string;
  appMode?: 'free' | 'premium';
  subscriptionType?: 'monthly' | 'yearly';
  subscriptionExpiration?: Date;
  isLoggedIn?: boolean;
}

interface StorageUser extends UserLocal {
  syncStatus: 'synced' | 'pending' | 'conflict';
}

const USER_LOCAL_KEY = 'user_subscription';

class UserLocalStorage {
  async init(): Promise<void> {
    try {
      const storedSubscription = await AsyncStorage.getItem(USER_LOCAL_KEY);
      if (!storedSubscription) {
        // Initialize with default values if no subscription exists
        const defaultUser: StorageUser = {
          appMode: 'free',
          syncStatus: 'synced',
        };
        await this.saveUserLocal(defaultUser);
      }
    } catch (error) {
      console.error('Error initializing user local storage:', error);
    }
  }

  async registerUserLocal({
    id,
    name,
    email,
  }: {
    id: string;
    name: string;
    email: string;
  }): Promise<void> {
    const userLocal: StorageUser = {
      id,
      name,
      email,
      appMode: 'free',
      syncStatus: 'synced',
      isLoggedIn: true,
    };
    await this.saveUserLocal(userLocal);
  }

  async loginUserLocal(userLocal: UserLocal): Promise<void> {
    const subscription: StorageUser = {
      ...userLocal,
      syncStatus: 'synced',
      isLoggedIn: true,
    };
    await this.saveUserLocal(subscription);
  }

  async logoutUserLocal(): Promise<void> {
    const userLocal: StorageUser = {
      appMode: 'free',
      syncStatus: 'synced',
      isLoggedIn: false,
      subscriptionType: undefined,
      subscriptionExpiration: undefined,
      id: undefined,
    };
    await this.saveUserLocal(userLocal);
  }

  async getUserLocalStorage(): Promise<StorageUser | null> {
    try {
      const storedSubscription = await AsyncStorage.getItem(USER_LOCAL_KEY);
      if (!storedSubscription) return null;
      const parsed: StorageUser = JSON.parse(storedSubscription);
      return parsed;
    } catch (error) {
      return null;
    }
  }

  async getUserLocal(): Promise<UserLocal> {
    try {
      const storedSubscription = await AsyncStorage.getItem(USER_LOCAL_KEY);
      if (!storedSubscription) return { appMode: 'free' };

      const parsed: StorageUser = JSON.parse(storedSubscription);
      return parsed;
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      return { appMode: 'free' };
    }
  }

  // Upgrade to premium mode
  async upgradeToPremium({
    subscriptionType,
    subscriptionExpiration,
  }: {
    subscriptionType: 'monthly' | 'yearly';
    subscriptionExpiration: Date;
  }): Promise<void> {
    const subscription: StorageUser | null = await this.getUserLocalStorage();
    if (!subscription) return;

    subscription.appMode = 'premium';
    subscription.subscriptionType = subscriptionType;
    subscription.subscriptionExpiration = subscriptionExpiration;

    await this.saveUserLocal(subscription);
  }

  // Reset to free mode (for cancellation or expiration)
  async resetToFreeMode(): Promise<void> {
    const userLocal = await this.getUserLocalStorage();
    if (!userLocal) return;

    userLocal.appMode = 'free';
    userLocal.subscriptionExpiration = undefined;
    userLocal.subscriptionType = undefined;

    await this.saveUserLocal(userLocal);
  }

  async updateSyncStatus(
    status: 'synced' | 'pending' | 'conflict'
  ): Promise<void> {
    const subscription = await this.getUserLocalStorage();
    if (!subscription) return;

    subscription.syncStatus = status;
    await this.saveUserLocal(subscription);
  }

  async updateUser({
    email,
    name,
    appMode,
    subscriptionType,
    subscriptionExpiration,
  }: UserLocal): Promise<boolean> {
    this.init(); // Ensure storage is initialized
    const subscription = await this.getUserLocalStorage();
    if (!subscription) return false;

    if (email) subscription.email = email;
    if (name) subscription.name = name;
    if (appMode) subscription.appMode = appMode;
    if (subscriptionType) subscription.subscriptionType = subscriptionType;
    if (subscriptionExpiration)
      subscription.subscriptionExpiration = subscriptionExpiration;
    subscription.syncStatus = 'pending';

    await this.saveUserLocal(subscription);
    return true;
  }

  checkExpiration({ expiration }: { expiration: Date }): boolean {
    const now = new Date();
    return expiration > now;
  }

  private async saveUserLocal(subscription: StorageUser): Promise<void> {
    await AsyncStorage.setItem(USER_LOCAL_KEY, JSON.stringify(subscription));
  }

  async clearUserLocal(): Promise<void> {
    await AsyncStorage.removeItem(USER_LOCAL_KEY);
  }
}

export const userLocalStorage = new UserLocalStorage();
