import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppMode = 'free' | 'premium';
export type SyncMode = 'local' | 'cloud';

export interface UserLocal {
  id?: string;
  name?: string;
  email?: string;
  appMode: "free" | "premium";
  subscriptionType?: 'monthly' | 'yearly';
  subscriptionExpiration?: Date;
}

const USER_LOCAL_KEY = 'user_subscription';

class UserLocalStorage {
  async getSubscription(): Promise<UserLocal> {
    let subscription: UserLocal = this.getDefaultSubscription();
    try {
      const storedSubscription = await AsyncStorage.getItem(USER_LOCAL_KEY);
      if (!storedSubscription) return this.getDefaultSubscription();
      
      const parsed: UserLocal = JSON.parse(storedSubscription);
      if (!parsed.subscriptionExpiration) return await this.resetToFreeMode();
      
      // Validate the subscription expiry date
      const subscriptionExpiration = new Date(parsed.subscriptionExpiration);      
      const isValid = this.checkExpiration({ expiration: subscriptionExpiration });
      if (!isValid) return await this.resetToFreeMode();
      
      parsed.subscriptionExpiration = subscriptionExpiration;
      subscription = parsed;
      await this.saveSubscription(subscription);

      return subscription;
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      return subscription;
    }
  }

  // Upgrade to premium mode
  async upgradeToPremium({
    subscriptionType,
  }: {
    subscriptionType: 'monthly' | 'yearly';
  }): Promise<void> {
    const now = new Date();
    const expiration = new Date(now);

    // Set expiry based on plan type
    if (subscriptionType === 'monthly') {
      expiration.setMonth(expiration.getMonth() + 1);
    } else {
      expiration.setFullYear(expiration.getFullYear() + 1);
    }

    const subscription: UserLocal = await this.getSubscription();
    subscription.appMode = 'premium';
    subscription.subscriptionType = subscriptionType;
    subscription.subscriptionExpiration = expiration;

    await this.saveSubscription(subscription);
  };

  async updateName(name: string): Promise<UserLocal> {
    const subscription = await this.getSubscription();
    subscription.name = name;
    await this.saveSubscription(subscription);
    return subscription;
  }

  // Reset to free mode (for cancellation or expiration)
  async resetToFreeMode(): Promise<UserLocal> {
    const subscription = await AsyncStorage.getItem(USER_LOCAL_KEY);
    if (!subscription) return this.getDefaultSubscription();

    const parsedSubscription: UserLocal = JSON.parse(subscription);
    parsedSubscription.appMode = 'free';
    parsedSubscription.subscriptionExpiration = undefined;
    parsedSubscription.subscriptionType = undefined;

    await this.saveSubscription(parsedSubscription);
    return parsedSubscription;
  }

  async updateUser({
    id,
    email,
    name,
    appMode,
    subscriptionType,
    subscriptionExpiration,
  }: {
    id?: string;
    email?: string;
    name?: string;
    appMode?: "free" | "premium"; // Optional, defaults to 'free'
    subscriptionType?: 'monthly' | 'yearly'; // Optional, defaults to 'monthly'
    subscriptionExpiration?: Date; // Optional, can be null for free users
  }): Promise<UserLocal> {
    const subscription = await this.getSubscription();
    if (id) subscription.id = id;
    if (email) subscription.email = email;
    if (name) subscription.name = name;
    if (appMode) subscription.appMode = appMode;
    if (subscriptionType) subscription.subscriptionType = subscriptionType;
    if (subscriptionExpiration) subscription.subscriptionExpiration = subscriptionExpiration;

    await this.saveSubscription(subscription);
    return subscription;
  }

  // Check for expiration and handle accordingly
  private checkExpiration({ expiration }: { expiration: Date }): boolean {
    const now = new Date();
    return expiration > now;
  }

  private async saveSubscription(
    subscription: UserLocal
  ): Promise<void> {
    await AsyncStorage.setItem(USER_LOCAL_KEY, JSON.stringify(subscription));
  }

  // Clear all subscription data (for testing or data reset)
  async clearSubscriptionData(): Promise<void> {
    await AsyncStorage.removeItem(USER_LOCAL_KEY);
  }

  // Get default subscription state
  private getDefaultSubscription(): UserLocal {
    return {
      appMode: 'free',
      id: undefined,
      name: undefined,
      email: undefined,
      subscriptionExpiration: undefined,
      subscriptionType: undefined,
    };
  }

  async clearUser(): Promise<void> {
    await AsyncStorage.removeItem(USER_LOCAL_KEY);
  }
}

export const userLocalStorage = new UserLocalStorage();
