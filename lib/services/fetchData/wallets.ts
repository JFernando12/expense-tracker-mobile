import { walletLocalStorage } from "@/lib/storage/walletLocalStorage";
import { Wallet } from "@/types/types";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import {
  createWalletOnServer,
  deleteWalletFromServer,
  updateWalletOnServer,
} from '../../appwrite';
import { getUser } from '../user/user';

export const createWallet = async ({
  isOnlineMode,
  data,
}: {
  isOnlineMode: boolean;
  data: Omit<Wallet, 'id' | 'currentBalance' | 'updatedAt'>;
}): Promise<boolean> => {
  const user = await getUser();
  if (!user.id) {
    console.error('User not found, cannot create wallet');
    return false;
  }
  const id = uuidv4();
  const updatedAt = new Date().toISOString();
  const currentBalance = data.initialBalance || 0;

  const { success } = await walletLocalStorage.createWallet({
    ...data,
    id,
    updatedAt,
    currentBalance,
  });
  if (!isOnlineMode) return success;

  await createWalletOnServer({
    userId: user.id,
    wallet: { ...data, id, updatedAt, currentBalance },
  });
  await walletLocalStorage.updateSyncStatus(id, 'synced');

  return success;
};

export const updateWallet = async ({
  input: { walletId, data },
  isOnlineMode,
}: {
  input: {
    walletId: string;
    data: Omit<Wallet, 'id' | 'currentBalance' | 'updatedAt'>;
  };
  isOnlineMode: boolean;
}): Promise<boolean> => {
  const user = await getUser();
  if (!user.id) {
    console.error('User not found, cannot update wallet');
    return false;
  }

  const updatedAt = new Date().toISOString();
  const oldWallet = await walletLocalStorage.getWallet({ id: walletId });
  if (!oldWallet) return false;

  const currentBalance =
    oldWallet.currentBalance - oldWallet.initialBalance + data.initialBalance;

  const { success } = await walletLocalStorage.updateWallet({
    id: walletId,
    data: { ...data, currentBalance, updatedAt },
  });
  if (!isOnlineMode) return success;

  await updateWalletOnServer({
    userId: user.id,
    walletId,
    data: { ...data, updatedAt },
  });
  await walletLocalStorage.updateSyncStatus(walletId, 'synced');

  return success;
};

export const getWallets = async (): Promise<Wallet[]> => {
  const localWallets = await walletLocalStorage.getWallets();
  return localWallets;
};

export const deleteWallet = async ({
  walletId,
  isOnlineMode,
}: {
  walletId: string;
  isOnlineMode: boolean;
}): Promise<boolean> => {
  const user = await getUser();
  if (!user.id) {
    console.error('User not found, cannot delete wallet');
    return false;
  }

  const deletedAt = new Date().toISOString();
  const updatedAt = new Date().toISOString();

  const { success } = await walletLocalStorage.deleteWallet({
    id: walletId,
    deletedAt,
    updatedAt,
  });
  if (!isOnlineMode) return success;

  await deleteWalletFromServer({
    userId: user.id,
    walletId,
    updatedAt,
    deletedAt,
  });
  await walletLocalStorage.updateSyncStatus(walletId, 'synced');
  return success;
};

export const getTotalBalance = async (): Promise<number> => {
  return await walletLocalStorage.getTotalBalance();
};
