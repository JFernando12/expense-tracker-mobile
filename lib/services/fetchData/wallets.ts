import { walletLocalStorage } from "@/lib/storage/walletLocalStorage";
import { Wallet } from "@/types/types";
import {
  createWalletOnServer,
  deleteWalletFromServer,
  getWalletsFromServer,
  updateWalletOnServer,
} from "../../appwrite";

export const createWallet = async ({
  isOnlineMode,
  data,
}: {
  isOnlineMode: boolean;
  data: Omit<Wallet, "id" | "currentBalance">;
}): Promise<boolean> => {
  const { localId } = await walletLocalStorage.createWallet(data);
  if (!isOnlineMode) return !!localId;

  await createWalletOnServer({ ...data, id: localId });
  await walletLocalStorage.updateSyncStatus(localId, "synced");

  return !!localId;
};

export const updateWallet = async ({
  input: { id, data },
  isOnlineMode,
}: {
  input: {
    id: string;
    data: Omit<Wallet, "id" | "currentBalance">;
  };
  isOnlineMode: boolean;
}): Promise<boolean> => {
  const result = await walletLocalStorage.updateWallet(id, data);
  if (!isOnlineMode) return result;

  await updateWalletOnServer({ id, data });
  await walletLocalStorage.updateSyncStatus(id, "synced");

  return result;
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
  const result = await walletLocalStorage.deleteWallet(id);
  if (!isOnlineMode) return result;

  await deleteWalletFromServer(id);
  await walletLocalStorage.updateSyncStatus(id, "synced");
  return result;
};

export const getTotalBalance = async (): Promise<number> => {
  return await walletLocalStorage.getTotalBalance();
};
