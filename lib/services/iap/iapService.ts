import { Alert, Platform } from "react-native";
import {
  acknowledgePurchaseAndroid,
  endConnection,
  finishTransaction,
  flushFailedPurchasesCachedAsPendingAndroid,
  getSubscriptions,
  initConnection,
  Purchase,
  PurchaseError,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestSubscription,
  SubscriptionPurchase,
} from 'react-native-iap';

// Product IDs for your subscription plans
export const SUBSCRIPTION_SKUS = {
  monthly: Platform.select({
    ios: 'com.jfernando2012.expensetracker.monthly',
    android: 'com.jfernando2012.expensetracker.monthly',
  })!,
  yearly: Platform.select({
    ios: 'com.jfernando2012.expensetracker.yearly',
    android: 'com.jfernando2012.expensetracker.yearly',
  })!,
};

export interface IAPProduct {
  productId: string;
  title?: string;
  description?: string;
  subscriptionType: "monthly" | "yearly";
  // Platform-specific price info
  priceString?: string;
  localizedPrice?: string;
  currency?: string;
}

class IAPService {
  private purchaseUpdateSubscription: any = null;
  private purchaseErrorSubscription: any = null;
  private products: IAPProduct[] = [];

  async initialize(): Promise<boolean> {
    try {
      const result = await initConnection();
      console.log("IAP connection initialized:", result);

      if (Platform.OS === "android") {
        await flushFailedPurchasesCachedAsPendingAndroid();
      }

      // Set up purchase listeners
      this.setupPurchaseListeners();

      // Load products
      await this.loadProducts();

      return true;
    } catch (error) {
      console.error("Failed to initialize IAP:", error);
      return false;
    }
  }

  private setupPurchaseListeners() {
    this.purchaseUpdateSubscription = purchaseUpdatedListener(
      (purchase: Purchase | SubscriptionPurchase) => {
        console.log("Purchase updated:", purchase);
        this.handlePurchaseUpdate(purchase);
      }
    );

    this.purchaseErrorSubscription = purchaseErrorListener(
      (error: PurchaseError) => {
        console.error("Purchase error:", error);
        this.handlePurchaseError(error);
      }
    );
  }

  private async handlePurchaseUpdate(
    purchase: Purchase | SubscriptionPurchase
  ) {
    try {
      const receipt = purchase.transactionReceipt;
      if (receipt) {
        // Verify the purchase with your backend here if needed
        console.log("Purchase successful:", purchase.productId);

        // Finish the transaction
        await finishTransaction({
          purchase,
          isConsumable: false,
        });

        if (Platform.OS === "android") {
          await acknowledgePurchaseAndroid({
            token: purchase.purchaseToken!,
          });
        }

        // Determine subscription type
        const subscriptionType =
          purchase.productId === SUBSCRIPTION_SKUS.monthly
            ? "monthly"
            : "yearly";

        // Return success callback with subscription info
        if (this.onPurchaseSuccess) {
          this.onPurchaseSuccess(subscriptionType, purchase);
        }
      }
    } catch (error) {
      console.error("Error handling purchase update:", error);
      if (this.onPurchaseError) {
        this.onPurchaseError(error as Error);
      }
    }
  }

  private handlePurchaseError(error: PurchaseError) {
    console.error("Purchase failed:", error);

    // Don't show error for user cancellation
    if (error.code === "E_USER_CANCELLED") {
      return;
    }

    Alert.alert(
      "Error de Compra",
      "No se pudo completar la compra. Por favor, inténtalo de nuevo.",
      [{ text: "OK" }]
    );

    if (this.onPurchaseError) {
      this.onPurchaseError(new Error(error.message));
    }
  }
  async loadProducts(): Promise<IAPProduct[]> {
    try {
      const products = await getSubscriptions({
        skus: Object.values(SUBSCRIPTION_SKUS),
      });

      this.products = products.map(
        (product): IAPProduct => ({
          productId: product.productId,
          title: product.title,
          description: product.description,
          subscriptionType:
            product.productId === SUBSCRIPTION_SKUS.monthly
              ? "monthly"
              : "yearly",
          // Extract price info based on platform
          priceString: (product as any).priceString || (product as any).price,
          localizedPrice: (product as any).localizedPrice,
          currency: (product as any).currency,
        })
      );

      console.log("Loaded IAP products:", this.products);
      return this.products;
    } catch (error) {
      console.error("Failed to load products:", error);
      return [];
    }
  }

  getProducts(): IAPProduct[] {
    return this.products;
  }

  getProductById(productId: string): IAPProduct | undefined {
    return this.products.find((product) => product.productId === productId);
  }

  async purchaseSubscription(
    subscriptionType: "monthly" | "yearly"
  ): Promise<void> {
    try {
      const productId = SUBSCRIPTION_SKUS[subscriptionType];

      if (!productId) {
        throw new Error(
          `No product ID found for ${subscriptionType} subscription`
        );
      }

      console.log("Attempting to purchase:", productId);

      await requestSubscription({
        sku: productId,
        ...(Platform.OS === "android" && {
          subscriptionOffers: [
            {
              sku: productId,
              offerToken: "", // You might need to get this from the product details
            },
          ],
        }),
      });
    } catch (error) {
      console.error("Purchase failed:", error);
      throw error;
    }
  }

  // Callback properties
  onPurchaseSuccess?: (
    subscriptionType: "monthly" | "yearly",
    purchase: Purchase | SubscriptionPurchase
  ) => void;
  onPurchaseError?: (error: Error) => void;

  async cleanup() {
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
      this.purchaseUpdateSubscription = null;
    }

    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
      this.purchaseErrorSubscription = null;
    }

    try {
      await endConnection();
    } catch (error) {
      console.error("Error ending IAP connection:", error);
    }
  }
}

export const iapService = new IAPService();
