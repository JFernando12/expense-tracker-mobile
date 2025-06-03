import { transactionLocalStorage } from "@/lib/storage/transactionLocalStorage";
import { walletLocalStorage } from "@/lib/storage/walletLocalStorage";
import { upsertTransactionOnServer, upsertWalletOnServer } from "../../appwrite";

export const syncTransactions = async (): Promise<number> => {
  console.log("Syncing transactions...");
  const localTransactions =
    await transactionLocalStorage.getTransactionsStorage();
  const pendingTransactions = localTransactions.filter(
    (transaction) => transaction.syncStatus === "pending"
  );

  for (const transaction of pendingTransactions) {
    try {
      await upsertTransactionOnServer(transaction);
      await transactionLocalStorage.updateSyncStatus(transaction.id, "synced");
    } catch (error) {
      console.error("Error syncing transaction:", error);
    }
  }

  return pendingTransactions.length;
};

export const syncWallets = async (): Promise<number> => {
  const localWallets = await walletLocalStorage.getWalletsStorage();
  const pendingWallets = localWallets.filter(
    (wallet) => wallet.syncStatus === "pending"
  );

  for (const wallet of pendingWallets) {
    try {
      await upsertWalletOnServer(wallet);
      await walletLocalStorage.updateSyncStatus(wallet.id, "synced");
    } catch (error) {
      console.error("Error syncing wallet:", error);
    }
  }

  return pendingWallets.length;
};
