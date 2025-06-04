import { transactionLocalStorage } from '@/lib/storage/transactionLocalStorage';
import { walletLocalStorage } from '@/lib/storage/walletLocalStorage';
import {
  getTransactionsFromServer,
  getWalletsFromServer,
  upsertTransactionOnServer,
  upsertWalletOnServer,
} from '../../appwrite';

export const syncData = async (): Promise<{
  transactionsSynced: number;
  walletsSynced: number;
}> => {
  const walletsSynced = await syncWallets();
  const transactionsSynced = await syncTransactions();

  return {
    transactionsSynced,
    walletsSynced,
  };
};

const syncWallets = async (): Promise<number> => {
  const localWallets = await walletLocalStorage.getWalletsStorage();
  const pendingWallets = localWallets.filter(
    (wallet) => wallet.syncStatus === 'pending'
  );

  for (const wallet of pendingWallets) {
    try {
      await upsertWalletOnServer(wallet);
      await walletLocalStorage.updateSyncStatus(wallet.id, 'synced');
    } catch (error) {
      console.error('Error syncing wallet:', error);
    }
  }

  // Getting wallets from the server to save them locally (only if does not exist or updatedAt is newer)
  const serverWallets = await getWalletsFromServer();
  for (const serverWallet of serverWallets) {
    const localWallet = localWallets.find(
      (wallet) => wallet.id === serverWallet.id
    );

    const localUpdatedAt = new Date(localWallet?.updatedAt || 0);
    const serverUpdatedAt = new Date(serverWallet.updatedAt);

    if (!localWallet) {
      // If the wallet does not exist locally, save it
      await walletLocalStorage.createWallet(serverWallet);
      await walletLocalStorage.updateSyncStatus(serverWallet.id, 'synced');
    } else if (serverUpdatedAt > localUpdatedAt) {
      // If the server wallet is newer, update the local storage
      await walletLocalStorage.updateWallet({
        id: serverWallet.id,
        data: serverWallet,
      });
      await walletLocalStorage.updateSyncStatus(serverWallet.id, 'synced');
    }
  }

  return pendingWallets.length;
};

const syncTransactions = async (): Promise<number> => {
  const localTransactions =
    await transactionLocalStorage.getTransactionsStorage();
  const pendingTransactions = localTransactions.filter(
    (transaction) => transaction.syncStatus === 'pending'
  );

  // Uploading pending transactions to the server
  for (const transaction of pendingTransactions) {
    try {
      await upsertTransactionOnServer(transaction);
      await transactionLocalStorage.updateSyncStatus(transaction.id, 'synced');
    } catch (error) {
      console.error('Error syncing transaction:', error);
    }
  }

  // Getting transactions from the server to save them locally (only if does not exist or updatedAt is newer)
  const serverTransactions = await getTransactionsFromServer();
  for (const serverTransaction of serverTransactions) {
    const localTransaction = localTransactions.find(
      (transaction) => transaction.id === serverTransaction.id
    );

    const localUpdatedAt = new Date(localTransaction?.updatedAt || 0);
    const serverUpdatedAt = new Date(serverTransaction.updatedAt);

    if (!localTransaction) {
      // If the transaction does not exist locally, save it
      await transactionLocalStorage.createTransaction(serverTransaction);
      await transactionLocalStorage.updateSyncStatus(
        serverTransaction.id,
        'synced'
      );
    } else if (serverUpdatedAt > localUpdatedAt) {
      // If the server transaction is newer, update the local storage
      await transactionLocalStorage.updateTransaction({
        id: serverTransaction.id,
        data: serverTransaction,
      });
      await transactionLocalStorage.updateSyncStatus(
        serverTransaction.id,
        'synced'
      );
    }
  }

  return pendingTransactions.length;
};
