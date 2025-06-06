import { subscriptionService, UserSubscription } from "./subscriptionService";

export const getUserSubscription = async (): Promise<UserSubscription> => {
  const userSubscription = await subscriptionService.getSubscription();
  return userSubscription;
}

export const toggleCloudSync = async (enabled: boolean): Promise<void> => {
  await subscriptionService.toggleCloudSync(enabled);
}

export const resetToFreeMode = async (): Promise<void> => {
  await subscriptionService.resetToFreeMode();
}

export const upgradeToPremium = async (planType: 'monthly' | 'yearly'): Promise<void> => {
  await subscriptionService.upgradeToPremium({ planType });
}