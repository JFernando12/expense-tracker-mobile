import { upsertTransactionOnServer, upsertWalletOnServer } from "../appwrite";
import { transactionLocalStorage } from "../storage/transactionLocalStorage";
import { walletLocalStorage } from "../storage/walletLocalStorage";

export const syncTransactions = async (): Promise<number> => {
  console.log('Syncing transactions...');
  const localTransactions =
    await transactionLocalStorage.getTransactionsStorage();
  const pendingTransactions = localTransactions.filter(
    (transaction) => transaction.syncStatus === 'pending'
  );

  for (const transaction of pendingTransactions) {
    try {
      await upsertTransactionOnServer(transaction);
      await transactionLocalStorage.updateSyncStatus(transaction.id, 'synced');
    } catch (error) {
      console.error('Error syncing transaction:', error);
    }
  }

  return pendingTransactions.length;
};

export const syncWallets = async (): Promise<number> => {
  console.log('Syncing wallets...');
  const localWallets = await walletLocalStorage.getWalletsStorage();
  const pendingWallets = localWallets.filter(
    (wallet) => wallet.syncStatus === 'pending'
  );

  for (const wallet of pendingWallets) {
    try {
      await upsertWalletOnServer(wallet);
      await transactionLocalStorage.updateSyncStatus(wallet.id, 'synced');
    } catch (error) {
      console.error('Error syncing wallet:', error);
    }
  }

  return pendingWallets.length;
};