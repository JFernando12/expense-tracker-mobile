import {
  loginOnServer,
  logoutOnServer,
  registerOnServer,
  updateUserOnServer,
  upgradeToPremiumOnServer,
} from '@/lib/appwrite/user';
import {
  SyncMode,
  UserLocal,
  userLocalStorage,
} from '@/lib/storage/userLocalStorage';

export const register = async ({
  input,
  networkEnabled,
}: {
  input: {
    email: string;
    password: string;
    name: string;
  };
  networkEnabled: boolean;
}): Promise<string | null> => {
  if (!networkEnabled) return null;

  const id = await registerOnServer({ ...input });
  if (!id) return null;

  await userLocalStorage.registerUserLocal({ ...input, id });
  return id;
};

export const login = async ({
  input: { email, password },
  networkEnabled,
}: {
  input: {
    email: string;
    password: string;
  };
  networkEnabled: boolean;
}): Promise<boolean> => {
  if (!networkEnabled) return false;

  const user = await loginOnServer(email, password);
  if (!user) return false;
  await userLocalStorage.loginUserLocal(user);
  return true;
};

export const logout = async ({
  networkEnabled,
}: {
  networkEnabled: boolean;
}): Promise<boolean> => {
  if (!networkEnabled) return false;

  const result = await logoutOnServer();
  if (!result) return false;
  await userLocalStorage.logoutUserLocal();
  return true;
};

export const getUser = async (): Promise<UserLocal> => {
  const userLocal = await userLocalStorage.getUserLocal();
  return userLocal;
};

export const updateUser = async ({
  data,
  networkEnabled,
}: {
  data: Omit<UserLocal, 'id'>;
  networkEnabled: boolean;
}): Promise<boolean> => {
  const user = await getUser();
  const id = user.id;
  if (!id) return false;

  await userLocalStorage.updateUser({ ...data });
  if (!networkEnabled) return false;

  await updateUserOnServer({ input: { id, data } });
  await userLocalStorage.updateSyncStatus('synced');
  return true;
};

export const upgradeToPremium = async ({
  subscriptionType,
  networkEnabled,
}: {
  subscriptionType: 'monthly' | 'yearly';
  networkEnabled: boolean;
}): Promise<boolean> => {
  if (!networkEnabled) return false;

  const subscriptionExpiration = new Date();
  if (subscriptionType === 'monthly') {
    subscriptionExpiration.setMonth(subscriptionExpiration.getMonth() + 1);
  } else if (subscriptionType === 'yearly') {
    subscriptionExpiration.setFullYear(
      subscriptionExpiration.getFullYear() + 1
    );
  }

  await userLocalStorage.upgradeToPremium({
    subscriptionType,
    subscriptionExpiration,
  });

  const user = await getUser();
  const id = user.id;
  if (!id) return false;

  await upgradeToPremiumOnServer({
    input: { userId: id, subscriptionType, subscriptionExpiration },
  });
  await userLocalStorage.updateSyncStatus('synced');

  return true;
};

export const updateSyncMode = async ({
  syncMode,
}: {
  syncMode: SyncMode;
}): Promise<void> => {
  await userLocalStorage.updateSyncMode(syncMode);
};
