/**
 * App Modes Management Summary
 * 
 * This file demonstrates how the free and premium modes work in your expense tracker app.
 */

import { useGlobalContext } from '@/lib/global-provider';
import { subscriptionService } from '@/lib/services/subscriptionService';

/**
 * 1. SUBSCRIPTION SERVICE
 * 
 * The core service that manages subscription state:
 * - Handles free/premium mode transitions
 * - Manages trial periods and expiration
 * - Controls cloud sync availability
 * - Persists state using AsyncStorage
 */

// Example usage:
const exampleSubscriptionService = async () => {
  // Initialize (done automatically by GlobalProvider)
  await subscriptionService.initialize();
  
  // Check current state
  const subscription = subscriptionService.getSubscription();
  console.log('Current mode:', subscription.mode); // 'free' | 'premium'
  console.log('Sync mode:', subscription.syncMode); // 'local' | 'cloud'
  
  // Feature checks
  const canUseCloudSync = subscriptionService.canAccessCloudSync();
  const canUsePremium = subscriptionService.canAccessPremiumFeatures();
  
  // Mode transitions
  await subscriptionService.startTrial(); // Start 7-day trial
  await subscriptionService.upgradeToPremium('monthly'); // Upgrade to monthly
  await subscriptionService.resetToFreeMode(); // Cancel subscription
};

/**
 * 2. GLOBAL CONTEXT INTEGRATION
 * 
 * Access subscription state throughout your app:
 */

const ExampleComponent = () => {
  const {
    // Subscription state
    subscription,
    appMode,
    isTrialActive,
    daysUntilExpiry,
    
    // Feature access
    canAccessCloudSync,
    canAccessPremiumFeatures,
    
    // Actions
    upgradeToPremium,
    startTrial,
    toggleCloudSync,
    resetToFreeMode,
  } = useGlobalContext();

  // Use these values in your UI logic
  return null; // Your component JSX here
};

/**
 * 3. MODE BEHAVIORS
 * 
 * Free Mode:
 * - Local storage only (default)
 * - Can login for basic cloud backup
 * - Limited features
 * - Upgrade prompts for premium features
 * 
 * Premium Mode:
 * - Full cloud synchronization
 * - All advanced features
 * - Available via subscription or trial
 * - Automatic data sync across devices
 */

/**
 * 4. FEATURE PROTECTION
 * 
 * Protect premium features using:
 * 
 * A) PremiumGuard component:
 */
/*
import PremiumGuard from '@/components/PremiumGuard';

<PremiumGuard feature="Advanced Analytics">
  <YourPremiumComponent />
</PremiumGuard>
*/

/**
 * B) Manual checks:
 */
const handlePremiumFeature = (canAccessPremiumFeatures: boolean) => {
  if (!canAccessPremiumFeatures) {
    // Show upgrade prompt
    return;
  }
  // Execute premium logic
};

/**
 * 5. USER FLOWS
 * 
 * New User Journey:
 * Free (Local) → Login (Optional) → Trial → Premium → Cancel/Expire
 * 
 * State transitions are handled automatically by the subscription service.
 */

/**
 * 6. SYNC BEHAVIOR
 * 
 * The app automatically adjusts sync behavior based on mode:
 * - Free + Not Logged In: Local storage only
 * - Free + Logged In: Local + basic cloud backup
 * - Premium: Full cloud sync with local cache
 */

export const AppModesDemo = {
  exampleSubscriptionService,
  ExampleComponent,
  handlePremiumFeature,
};
