import { transactionLocalStorage } from '@/lib/storage/transactionLocalStorage';
import { walletLocalStorage } from '@/lib/storage/walletLocalStorage';

export const clearLocalData = async (): Promise<void> => {
  // Clear all local data
  await Promise.all([
    walletLocalStorage.clearWallets(),
    transactionLocalStorage.clearTransactions(),
  ]);
  console.log('Local data cleared successfully.');
};
