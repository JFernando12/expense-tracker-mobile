import { loginLocalStorage } from "@/lib/storage/loginLocalStorage";
import { transactionLocalStorage } from "@/lib/storage/transactionLocalStorage";
import { userLocalStorage } from "@/lib/storage/userLocalStorage";
import { walletLocalStorage } from "@/lib/storage/walletLocalStorage";

export const clearLocalData = async (): Promise<void> => {
    // Clear all local data
    await Promise.all([
        walletLocalStorage.clearWallets(),
        transactionLocalStorage.clearTransactions(),
    ]);
    
    console.log("Local data cleared successfully.");
};

export const clearLocalUser = async (): Promise<void> => {
    // Clear user-related data
    await userLocalStorage.clearUser();
    await loginLocalStorage.clearLoginStatus();
    console.log("Local user cleared successfully.");
}