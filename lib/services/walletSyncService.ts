import { Wallet } from "@/types/types";
import { getCurrentUser } from "../appwrite/auth";
import {
    createWalletOnServer,
    deleteWalletFromServer,
    getWalletsFromServer,
    updateWalletOnServer,
} from "../appwrite/wallets";
import { PendingWalletChange, walletStorage } from "../storage/walletStorage";
import { networkService } from "./networkService";

class WalletSyncService {
  private syncInProgress = false;

  constructor() {
    // Listen for network changes and sync when back online
    networkService.onNetworkChange((isConnected) => {
      if (isConnected && !this.syncInProgress) {
        this.syncPendingChanges();
      }
    });
  }

  // Create wallet (works offline)
  async createWallet(walletData: {
    name: string;
    description: string;
    initialBalance: number;
  }): Promise<Wallet | null> {
    try {
      if (networkService.isOnline()) {
        // Try online creation first
        const result = await createWalletOnServer(walletData);
        if (result) {
          // Save to local storage as synced
          await walletStorage.upsertWallet(result, true);
          return result;
        }
      }

      // Create offline
      const offlineWallet = await walletStorage.createWalletOffline({
        ...walletData,
        currentBalance: walletData.initialBalance,
      });
      
      return {
        id: offlineWallet.id,
        name: offlineWallet.name,
        description: offlineWallet.description,
        initialBalance: offlineWallet.initialBalance,
        currentBalance: offlineWallet.currentBalance,
      };
    } catch (error) {
      console.error("Error creating wallet:", error);
      // Fallback to offline creation
      const offlineWallet = await walletStorage.createWalletOffline({
        ...walletData,
        currentBalance: walletData.initialBalance,
      });
      return {
        id: offlineWallet.id,
        name: offlineWallet.name,
        description: offlineWallet.description,
        initialBalance: offlineWallet.initialBalance,
        currentBalance: offlineWallet.currentBalance,
      };
    }
  }

  // Update wallet (works offline)
  async updateWallet(updateData: {
    id: string;
    name: string;
    description: string;
    initialBalance: number;
  }): Promise<Wallet | null> {
    try {
      if (networkService.isOnline()) {
        // Try online update first
        const result = await updateWalletOnServer(updateData);
        if (result) {
          // Save to local storage as synced
          await walletStorage.upsertWallet(result, true);
          return result;
        }
      }

      // Update offline
      await walletStorage.updateWallet(updateData.id, {
        name: updateData.name,
        description: updateData.description,
        initialBalance: updateData.initialBalance,
      });

      const updatedWallet = await walletStorage.getWallet(updateData.id);
      return updatedWallet
        ? {
            id: updatedWallet.id,
            name: updatedWallet.name,
            description: updatedWallet.description,
            initialBalance: updatedWallet.initialBalance,
            currentBalance: updatedWallet.currentBalance,
          }
        : null;
    } catch (error) {
      console.error("Error updating wallet:", error);

      // Fallback to offline update
      await walletStorage.updateWallet(updateData.id, {
        name: updateData.name,
        description: updateData.description,
        initialBalance: updateData.initialBalance,
      });

      const updatedWallet = await walletStorage.getWallet(updateData.id);
      return updatedWallet
        ? {
            id: updatedWallet.id,
            name: updatedWallet.name,
            description: updatedWallet.description,
            initialBalance: updatedWallet.initialBalance,
            currentBalance: updatedWallet.currentBalance,
          }
        : null;
    }
  }

  // Delete wallet (works offline)
  async deleteWallet(id: string): Promise<boolean> {
    try {
      if (networkService.isOnline()) {
        // Try online deletion first
        const result = await deleteWalletFromServer(id);
        if (result) {
          // Remove from local storage
          await walletStorage.deleteWallet(id);
          return true;
        }
      }

      // Delete offline (will be synced later)
      await walletStorage.deleteWallet(id);
      return true;
    } catch (error) {
      console.error("Error deleting wallet:", error);

      // Fallback to offline deletion
      await walletStorage.deleteWallet(id);
      return true;
    }
  }

  // Get wallets (from local storage first, then sync if online)
  async getWallets(): Promise<Wallet[]> {
    try {
      // Always return local data first for better UX
      const localWallets = await walletStorage.getWallets();
      const wallets: Wallet[] = localWallets.map((w) => ({
        id: w.id,
        name: w.name,
        description: w.description,
        initialBalance: w.initialBalance,
        currentBalance: w.currentBalance,
      }));

      // Sync in background if online
      if (networkService.isOnline() && !this.syncInProgress) {
        this.syncWalletsInBackground();
      }

      return wallets;
    } catch (error) {
      console.error("Error getting wallets:", error);
      return [];
    }
  }

  // Get total balance (from local storage)
  async getTotalBalance(): Promise<number> {
    try {
      return await walletStorage.getTotalBalance();
    } catch (error) {
      console.error("Error getting total balance:", error);
      return 0;
    }
  }

  // Background sync of wallets from server
  private async syncWalletsInBackground() {
    try {
      if (!networkService.isOnline()) return;
      const serverWallets = await getWalletsFromServer();
      const localWallets = await walletStorage.getWallets();

      // Update local storage with server data
      for (const serverWallet of serverWallets) {
        const localWallet = localWallets.find((w) => w.id === serverWallet.id);

        if (!localWallet || localWallet.syncStatus === "synced") {
          // New wallet from server or local wallet is already synced
          await walletStorage.upsertWallet(serverWallet, true);
        }
        // If local wallet has pending changes, keep it as is
      }

      // Sync pending changes
      await this.syncPendingChanges();
    } catch (error) {
      console.error("Background sync failed:", error);
    }
  }

  // Sync pending changes to server
  async syncPendingChanges(): Promise<void> {
    if (this.syncInProgress || !networkService.isOnline()) return;

    this.syncInProgress = true;
    try {
      const pendingChanges = await walletStorage.getPendingChanges();

      for (const change of pendingChanges) {
        try {
          await this.processPendingChange(change);
          await walletStorage.removePendingChange(change.id);
        } catch (error) {
          console.error(
            `Failed to sync change for wallet ${change.id}:`,
            error
          );
          // Continue with next change
        }
      }

      await walletStorage.updateLastSyncTime();
    } catch (error) {
      console.error("Error syncing pending changes:", error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async processPendingChange(
    change: PendingWalletChange
  ): Promise<void> {
    const user = await getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    switch (change.type) {
      case "create":
        if (change.data && change.localId) {
          const result = await createWalletOnServer({
            name: change.data.name!,
            description: change.data.description!,
            initialBalance: change.data.initialBalance!,
          });

          if (result) {
            // Replace local wallet with server wallet
            await walletStorage.deleteWallet(change.localId);
            await walletStorage.upsertWallet(result, true);
          }
        }
        break;

      case "update":
        if (change.data) {
          const localWallet = await walletStorage.getWallet(change.id);
          if (localWallet && !localWallet.isLocal) {
            await updateWalletOnServer({
              id: change.id,
              name: change.data.name!,
              description: change.data.description!,
              initialBalance: change.data.initialBalance!,
            });

            // Mark as synced
            localWallet.syncStatus = "synced";
            await walletStorage.upsertWallet(localWallet, true);
          }
        }
        break;

      case "delete":
        await deleteWalletFromServer(change.id);
        break;
    }
  }

  // Force sync (useful for manual refresh)
  async forceSync(): Promise<void> {
    if (!networkService.isOnline()) {
      throw new Error("No internet connection");
    }

    await this.syncPendingChanges();
    await this.syncWalletsInBackground();
  }

  // Get sync status
  async getSyncStatus(): Promise<{
    lastSync: number;
    pendingChanges: number;
    isOnline: boolean;
  }> {
    const lastSync = await walletStorage.getLastSyncTime();
    const pendingChanges = await walletStorage.getPendingChanges();

    return {
      lastSync,
      pendingChanges: pendingChanges.length,
      isOnline: networkService.isOnline(),
    };
  }

  // Clear all local data (for logout)
  async clearLocalData(): Promise<void> {
    await walletStorage.clearAllData();
  }
}

export const walletSyncService = new WalletSyncService();
