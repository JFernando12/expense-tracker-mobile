import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppMode = 'free' | 'premium';
export type SyncMode = 'local' | 'cloud';

export interface UserSubscription {
  mode: AppMode;
  syncMode: SyncMode;
  isLoggedIn: boolean;
  subscriptionExpiry?: Date;
  trialExpiry?: Date;
  isTrialActive: boolean;
  planType?: 'monthly' | 'yearly' | 'trial';
}

const SUBSCRIPTION_KEY = 'user_subscription';

class SubscriptionService {
  private static instance: SubscriptionService;
  private subscription: UserSubscription | null = null;

  private constructor() {}

  static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  // Initialize the subscription state from storage
  async initialize(): Promise<UserSubscription> {
    try {
      const storedSubscription = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
      if (storedSubscription) {
        const parsed = JSON.parse(storedSubscription);
        // Convert date strings back to Date objects
        if (parsed.subscriptionExpiry) {
          parsed.subscriptionExpiry = new Date(parsed.subscriptionExpiry);
        }
        if (parsed.trialExpiry) {
          parsed.trialExpiry = new Date(parsed.trialExpiry);
        }
        this.subscription = parsed;
      } else {
        // Default to free mode with local storage
        this.subscription = {
          mode: 'free',
          syncMode: 'local',
          isLoggedIn: false,
          isTrialActive: false,
        };
      }
        // Check if subscription or trial has expired
      await this.checkExpiration();
      
      return this.subscription!; // We know it's not null at this point
    } catch (error) {
      console.error('Error initializing subscription:', error);
      const defaultSub = this.getDefaultSubscription();
      this.subscription = defaultSub;
      return defaultSub;
    }
  }
  // Get current subscription state
  getSubscription(): UserSubscription {
    if (!this.subscription) {
      return this.getDefaultSubscription();
    }
    return this.subscription;
  }
  // Set user as logged in (doesn't affect sync mode in free version)
  async setUserLoggedIn(isLoggedIn: boolean): Promise<void> {
    if (!this.subscription) {
      await this.initialize();
    }
    
    this.subscription!.isLoggedIn = isLoggedIn;
    
    // If user logs out, ensure local mode (but don't change if premium)
    if (!isLoggedIn && this.subscription!.mode === 'free') {
      this.subscription!.syncMode = 'local';
    }
    
    await this.saveSubscription();
  }

  // Upgrade to premium mode
  async upgradeToPremium(planType: 'monthly' | 'yearly'): Promise<void> {
    if (!this.subscription) {
      await this.initialize();
    }

    const now = new Date();
    const expiryDate = new Date(now);
    
    // Set expiry based on plan type
    if (planType === 'monthly') {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }

    this.subscription!.mode = 'premium';
    this.subscription!.syncMode = 'cloud';
    this.subscription!.planType = planType;
    this.subscription!.subscriptionExpiry = expiryDate;
    this.subscription!.isTrialActive = false;
    this.subscription!.trialExpiry = undefined;

    await this.saveSubscription();
  }

  // Start trial period
  async startTrial(): Promise<void> {
    if (!this.subscription) {
      await this.initialize();
    }

    const now = new Date();
    const trialExpiry = new Date(now);
    trialExpiry.setDate(trialExpiry.getDate() + 7); // 7 days trial

    this.subscription!.mode = 'premium';
    this.subscription!.syncMode = 'cloud';
    this.subscription!.planType = 'trial';
    this.subscription!.isTrialActive = true;
    this.subscription!.trialExpiry = trialExpiry;

    await this.saveSubscription();
  }
  // Check if features are available
  canAccessCloudSync(): boolean {
    const sub = this.getSubscription();
    return sub.mode === 'premium';
  }

  canAccessPremiumFeatures(): boolean {
    const sub = this.getSubscription();
    return sub.mode === 'premium';
  }

  isInTrialPeriod(): boolean {
    const sub = this.getSubscription();
    return sub.isTrialActive && sub.trialExpiry ? new Date() < sub.trialExpiry : false;
  }

  isSubscriptionActive(): boolean {
    const sub = this.getSubscription();
    if (sub.mode === 'free') return true; // Free mode is always "active"
    
    return this.isInTrialPeriod() || 
           (sub.subscriptionExpiry ? new Date() < sub.subscriptionExpiry : false);
  }

  getDaysUntilExpiry(): number | null {
    const sub = this.getSubscription();
    const expiryDate = sub.isTrialActive ? sub.trialExpiry : sub.subscriptionExpiry;
    
    if (!expiryDate) return null;
    
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  }
  // Enable/disable cloud sync (premium-only feature)
  async toggleCloudSync(enabled: boolean): Promise<void> {
    if (!this.subscription) {
      await this.initialize();
    }

    // Only allow cloud sync for premium users
    if (enabled && this.subscription!.mode !== 'premium') {
      throw new Error('Cloud sync requires premium subscription');
    }

    this.subscription!.syncMode = enabled ? 'cloud' : 'local';
    await this.saveSubscription();
  }
  // Reset to free mode (for cancellation or expiration)
  async resetToFreeMode(): Promise<void> {
    if (!this.subscription) {
      await this.initialize();
    }

    this.subscription!.mode = 'free';
    this.subscription!.syncMode = 'local'; // Free mode is always local
    this.subscription!.planType = undefined;
    this.subscription!.subscriptionExpiry = undefined;
    this.subscription!.isTrialActive = false;
    this.subscription!.trialExpiry = undefined;

    await this.saveSubscription();
  }

  // Check for expiration and handle accordingly
  private async checkExpiration(): Promise<void> {
    if (!this.subscription) return;

    const now = new Date();
    
    // Check trial expiration
    if (this.subscription.isTrialActive && this.subscription.trialExpiry) {
      if (now >= this.subscription.trialExpiry) {
        await this.resetToFreeMode();
        return;
      }
    }
    
    // Check subscription expiration
    if (this.subscription.subscriptionExpiry) {
      if (now >= this.subscription.subscriptionExpiry) {
        await this.resetToFreeMode();
        return;
      }
    }
  }

  private getDefaultSubscription(): UserSubscription {
    return {
      mode: 'free',
      syncMode: 'local',
      isLoggedIn: false,
      isTrialActive: false,
    };
  }

  private async saveSubscription(): Promise<void> {
    if (this.subscription) {
      await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(this.subscription));
    }
  }

  // Clear all subscription data (for testing or data reset)
  async clearSubscriptionData(): Promise<void> {
    await AsyncStorage.removeItem(SUBSCRIPTION_KEY);
    this.subscription = this.getDefaultSubscription();
  }
}

export const subscriptionService = SubscriptionService.getInstance();
