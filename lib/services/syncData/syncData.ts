import { transactionLocalStorage } from '@/lib/storage/transactionLocalStorage';
import { walletLocalStorage } from '@/lib/storage/walletLocalStorage';
import { createDownloadResumable } from 'expo-file-system';
import { v4 as uuidv4 } from 'uuid';
import {
  getTransactionsFromServer,
  getWalletsFromServer,
  upsertTransactionOnServer,
  upsertWalletOnServer,
} from '../../appwrite';
import { getUser } from '../user/user';

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
  const user = await getUser();
  if (!user.id) {
    console.error('User not found, cannot sync wallets');
    return 0;
  }

  const localWallets = await walletLocalStorage.getWalletsStorage();
  const pendingWallets = localWallets.filter(
    (wallet) => wallet.syncStatus === 'pending'
  );

  for (const wallet of pendingWallets) {
    const result = await upsertWalletOnServer({ wallet, userId: user.id });
    if (!result) continue;
    await walletLocalStorage.updateSyncStatus(wallet.id, 'synced');
  }

  // Getting wallets from the server to save them locally (only if does not exist or updatedAt is newer)
  const serverWallets = await getWalletsFromServer({ userId: user.id });
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
  const user = await getUser();
  if (!user.id) {
    console.error('User not found, cannot sync transactions');
    return 0;
  }
  const localTransactions =
    await transactionLocalStorage.getTransactionsStorage();
  const pendingTransactions = localTransactions.filter(
    (transaction) => transaction.syncStatus === 'pending'
  );

  // Uploading pending transactions to the server
  for (const transaction of pendingTransactions) {
    const result = await upsertTransactionOnServer({
      transaction,
      userId: user.id,
    });
    if (!result) continue;
    await transactionLocalStorage.updateSyncStatus(transaction.id, 'synced');
  }

  // Getting transactions from the server to save them locally (only if does not exist or updatedAt is newer)
  const serverTransactions = await getTransactionsFromServer({
    userId: user.id,
  });

  for (const serverTransaction of serverTransactions) {
    const localTransaction = localTransactions.find(
      (transaction) => transaction.id === serverTransaction.id
    );

    const localUpdatedAt = new Date(localTransaction?.updatedAt || 0);
    const serverUpdatedAt = new Date(serverTransaction.updatedAt);
    const isLocalOutdated = serverUpdatedAt > localUpdatedAt;
    if (
      !serverTransaction?.deletedAt &&
      serverTransaction.imageUrl &&
      (!localTransaction || isLocalOutdated)
    ) {
      try {
        const uniqueFilename = `synced_${uuidv4()}`;
        const documentDirectory = require('expo-file-system').documentDirectory;

        if (documentDirectory) {
          const filePath = `${documentDirectory}${uniqueFilename}.jpg`;
          console.log('Downloading image to:', filePath);

          const downloadResumable = createDownloadResumable(
            serverTransaction.imageUrl,
            filePath
          );

          const localImage = await downloadResumable.downloadAsync();
          console.log('Image downloaded:', localImage?.uri);

          if (localImage?.uri) {
            // Verify the downloaded file using our utility
            const { saveImageToDocuments } = await import(
              '@/lib/utils/imageUtils'
            );
            const saveResult = await saveImageToDocuments(
              localImage.uri,
              'synced_transaction'
            );

            if (saveResult.success && saveResult.uri) {
              serverTransaction.imageUrl = saveResult.uri;
            } else {
              console.warn(
                'Failed to properly save synced image:',
                saveResult.error
              );
              // Continue without the image rather than failing the entire sync
              serverTransaction.imageUrl = null;
            }
          }
        }
      } catch (error) {
        console.error('Error downloading image during sync:', error);
        // Continue sync without the image rather than failing
        serverTransaction.imageUrl = null;
      }
    }

    if (!localTransaction) {
      await transactionLocalStorage.createTransaction(serverTransaction);
      await transactionLocalStorage.updateSyncStatus(
        serverTransaction.id,
        'synced'
      );
    } else if (isLocalOutdated) {
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
