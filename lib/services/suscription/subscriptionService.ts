import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppMode = 'free' | 'premium';
export type SyncMode = 'local' | 'cloud';

export interface UserSubscription {
  mode: AppMode;
  syncMode: SyncMode;
  subscriptionExpiry?: Date;
  planType?: 'monthly' | 'yearly';
}

const SUBSCRIPTION_KEY = 'user_subscription';

class SubscriptionService {
  async getSubscription(): Promise<UserSubscription> {
    let subscription: UserSubscription = this.getDefaultSubscription();
    try {
      const storedSubscription = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
      if (!storedSubscription) return this.getDefaultSubscription();
      
      const parsed = JSON.parse(storedSubscription);
      if (!parsed.subscriptionExpiry) return this.getDefaultSubscription();
      
      // Validate the subscription expiry date
      const subscriptionExpiry = new Date(parsed.subscriptionExpiry);      
      const isValid = this.checkExpiration({ expiration: subscriptionExpiry });
      if (!isValid) return this.getDefaultSubscription();
      
      parsed.subscriptionExpiry = subscriptionExpiry;
      subscription = parsed;
      await this.saveSubscription(subscription);

      return subscription;
    } catch (error) {
      return subscription;
    }
  }

  // Upgrade to premium mode
  async upgradeToPremium({
    planType,
  }: {
    planType: 'monthly' | 'yearly';
  }): Promise<void> {
    const now = new Date();
    const expiryDate = new Date(now);

    // Set expiry based on plan type
    if (planType === 'monthly') {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }

    const subscription: UserSubscription = {
      mode: 'premium',
      syncMode: 'local',
      subscriptionExpiry: expiryDate,
      planType,
    };

    await this.saveSubscription(subscription);
  }

  async toggleCloudSync(enabled: boolean): Promise<void> {
    const subscription = await this.getSubscription();
    if (enabled && subscription.mode !== 'premium') return;
    subscription.syncMode = enabled ? 'cloud' : 'local';
    await this.saveSubscription(subscription);
  }

  // Reset to free mode (for cancellation or expiration)
  async resetToFreeMode(): Promise<void> {
    const subscription = this.getDefaultSubscription();
    await this.saveSubscription(subscription);
  }

  // Check for expiration and handle accordingly
  private checkExpiration({ expiration }: { expiration: Date }): boolean {
    const now = new Date();
    return expiration > now;
  }

  private async saveSubscription(
    subscription: UserSubscription
  ): Promise<void> {
    await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
  }

  // Clear all subscription data (for testing or data reset)
  async clearSubscriptionData(): Promise<void> {
    await AsyncStorage.removeItem(SUBSCRIPTION_KEY);
  }

  // Get default subscription state
  private getDefaultSubscription(): UserSubscription {
    return {
      mode: 'free',
      syncMode: 'local',
      subscriptionExpiry: undefined,
    };
  }
}

export const subscriptionService = new SubscriptionService();
