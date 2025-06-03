import { walletLocalStorage } from "@/lib/storage/walletLocalStorage";
import { Wallet } from "@/types/types";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import {
  createWalletOnServer,
  deleteWalletFromServer,
  getWalletsFromServer,
  updateWalletOnServer,
} from '../../appwrite';

export const createWallet = async ({
  isOnlineMode,
  data,
}: {
  isOnlineMode: boolean;
  data: Omit<Wallet, 'id' | 'currentBalance' | 'updatedAt'>;
}): Promise<boolean> => {
  const id = uuidv4();
  const updatedAt = Date.now();
  const currentBalance = data.initialBalance || 0;

  const { success } = await walletLocalStorage.createWallet({
    ...data,
    id,
    updatedAt,
    currentBalance,
  });
  if (!isOnlineMode) return success;

  await createWalletOnServer({ ...data, id, updatedAt, currentBalance });
  await walletLocalStorage.updateSyncStatus(id, 'synced');

  return success;
};

export const updateWallet = async ({
  input: { id, data },
  isOnlineMode,
}: {
  input: {
    id: string;
    data: Omit<Wallet, 'id' | 'currentBalance' | 'updatedAt'>;
  };
  isOnlineMode: boolean;
}): Promise<boolean> => {
  const { success, updatedAt } = await walletLocalStorage.updateWallet({
    id,
    data,
  });
  if (!isOnlineMode) return success;

  await updateWalletOnServer({ id, data: { ...data, updatedAt } });
  await walletLocalStorage.updateSyncStatus(id, 'synced');

  return success;
};

export const getWallets = async ({
  isOnlineMode,
}: {
  isOnlineMode: boolean;
}): Promise<Wallet[]> => {
  const localWallets = await walletLocalStorage.getWallets();
  if (!isOnlineMode) return localWallets;

  const serverWallets = await getWalletsFromServer();

  const totalWallets = [...localWallets];
  for (const serverWallet of serverWallets) {
    const existingWallet = totalWallets.find(
      (wallet) => wallet.id === serverWallet.id
    );
    if (existingWallet) {
      Object.assign(existingWallet, serverWallet);
    } else {
      totalWallets.push(serverWallet);
    }
  }

  return totalWallets;
};

export const deleteWallet = async ({
  id,
  isOnlineMode,
}: {
  id: string;
  isOnlineMode: boolean;
}): Promise<boolean> => {
  const { success, updatedAt } = await walletLocalStorage.deleteWallet({ id });
  if (!isOnlineMode) return success;

  await deleteWalletFromServer({ id, updatedAt });
  await walletLocalStorage.updateSyncStatus(id, 'synced');
  return success;
};

export const getTotalBalance = async (): Promise<number> => {
  return await walletLocalStorage.getTotalBalance();
};
