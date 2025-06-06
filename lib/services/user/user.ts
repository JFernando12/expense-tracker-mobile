import { UserLocal, userLocalStorage } from "@/lib/storage/userLocalStorage";

export const getUserLocal = async (): Promise<UserLocal> => {
  const userLocal = await userLocalStorage.getSubscription();
  return userLocal;
};

export const updateUserNameLocal = async (name: string): Promise<UserLocal> => {
  const updatedSubscription = await userLocalStorage.updateName(name);
  return updatedSubscription;
};

export const updateUserLocal = async (data: {
  id?: string;
  name?: string;
  email?: string;
  appMode?: "free" | "premium";
  subscriptionType?: "monthly" | "yearly";
  subscriptionExpiration?: Date;
}): Promise<UserLocal> => {
  const updatedSubscription = await userLocalStorage.updateUser(data);
  return updatedSubscription;
};

export const resetToFreeLocal = async (): Promise<void> => {
  await userLocalStorage.resetToFreeMode();
};

export const upgradeToPremiumLocal = async (
  subscriptionType: "monthly" | "yearly"
): Promise<void> => {
  await userLocalStorage.upgradeToPremium({ subscriptionType });
};
