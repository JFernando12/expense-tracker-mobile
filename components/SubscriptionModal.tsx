import { useGlobalContext } from "@/lib/global-provider";
import { IAPProduct, iapService } from "@/lib/services/iap/iapService";
import { completeIAPPurchase, register } from "@/lib/services/user/user";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { Purchase, SubscriptionPurchase } from "react-native-iap";
import { SafeAreaView } from "react-native-safe-area-context";

interface SubscriptionPlan {
  id: "monthly" | "yearly";
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular: boolean;
  productId?: string;
}

// Default subscription plans (will be updated with IAP product info)
const defaultSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: "monthly",
    title: "Plan Mensual",
    price: "$4.99",
    period: "/mes",
    description: "Perfecto para comenzar",
    features: [
      "Sincronización automática en la nube",
      "Respaldo seguro de tus datos",
      "Actualizaciones en tiempo real",
    ],
    popular: false,
  },
  {
    id: "yearly",
    title: "Plan Anual",
    price: "$39.99",
    period: "/año",
    description: "Ahorra 33% - ¡Mejor valor!",
    features: [
      "Sincronización automática en la nube",
      "Respaldo seguro de tus datos",
      "Actualizaciones en tiempo real",
      "Soporte prioritario",
    ],
    popular: true,
  },
];

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  userData?: {
    email: string;
    password: string;
    name: string;
  };
}

const SubscriptionModal = ({
  visible,
  onClose,
  userData,
}: SubscriptionModalProps) => {
  const { isNetworkEnabled, userLocal, refetchUserLocal } = useGlobalContext();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState<
    SubscriptionPlan[]
  >(defaultSubscriptionPlans);
  const [iapInitialized, setIapInitialized] = useState(false);

  const handlePurchaseError = useCallback((error: Error) => {
    console.error("Purchase error:", error);
    setIsLoading(false);

    Alert.alert(
      "Error en la Compra",
      "No se pudo completar la suscripción. Por favor, inténtalo de nuevo.",
      [{ text: "OK" }]
    );
  }, []);

  const handlePurchaseSuccess = useCallback(
    async (
      subscriptionType: "monthly" | "yearly",
      purchase: Purchase | SubscriptionPurchase
    ) => {
      try {
        // Complete the purchase and update user subscription
        const success = await completeIAPPurchase({
          subscriptionType,
          purchase,
          networkEnabled: isNetworkEnabled,
        });

        if (success) {
          // If userData is provided and the user is not logged in, register the user
          if (userData && !userLocal?.isLoggedIn) {
            await register({
              networkEnabled: isNetworkEnabled,
              input: {
                email: userData.email,
                password: userData.password,
                name: userData.name,
              },
            });
          }

          // Refetch user data to update the local state
          await refetchUserLocal();

          Alert.alert(
            "¡Suscripción Exitosa!",
            "Tu suscripción premium ha sido activada. Ahora puedes sincronizar tus datos en la nube.",
            [
              {
                text: "Continuar",
                onPress: () => {
                  setIsLoading(false);
                  onClose();
                },
              },
            ]
          );
        } else {
          throw new Error("Failed to complete purchase");
        }
      } catch (error) {
        console.error("Error handling purchase success:", error);
        handlePurchaseError(error as Error);
      }
    },
    [
      isNetworkEnabled,
      userLocal,
      userData,
      refetchUserLocal,
      onClose,
      handlePurchaseError,
    ]
  );

  const updatePlansWithIAPProducts = useCallback((products: IAPProduct[]) => {
    const updatedPlans = defaultSubscriptionPlans.map((plan) => {
      const product = products.find((p) => p.subscriptionType === plan.id);
      if (product) {
        return {
          ...plan,
          price: product.localizedPrice || plan.price,
          productId: product.productId,
        };
      }
      return plan;
    });
    setSubscriptionPlans(updatedPlans);
  }, []);

  const setupIAPCallbacks = useCallback(() => {
    iapService.onPurchaseSuccess = handlePurchaseSuccess;
    iapService.onPurchaseError = handlePurchaseError;
  }, [handlePurchaseSuccess, handlePurchaseError]);

  const cleanupIAP = useCallback(() => {
    iapService.cleanup();
    setIapInitialized(false);
  }, []);

  // Initialize IAP service when modal becomes visible
  const initializeIAP = useCallback(async () => {
    try {
      const initialized = await iapService.initialize();
      if (initialized) {
        setIapInitialized(true);
        const products = iapService.getProducts();
        updatePlansWithIAPProducts(products);
        setupIAPCallbacks();
      } else {
        console.warn("IAP initialization failed, using default prices");
      }
    } catch (error) {
      console.error("Error initializing IAP:", error);
    }
  }, [updatePlansWithIAPProducts, setupIAPCallbacks]);

  useEffect(() => {
    if (visible && !iapInitialized) {
      initializeIAP();
    }
    return () => {
      if (visible) {
        cleanupIAP();
      }
    };
  }, [visible, iapInitialized, initializeIAP, cleanupIAP]);

  const handleSubscription = async (planId: "monthly" | "yearly") => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      if (iapInitialized) {
        // Use IAP for purchase
        await iapService.purchaseSubscription(planId);
        // Purchase success/error will be handled by callbacks
      } else {
        // Fallback: direct upgrade without IAP (for testing or if IAP fails)
        Alert.alert(
          "Función No Disponible",
          "El sistema de pagos no está disponible en este momento. Por favor, inténtalo más tarde.",
          [
            {
              text: "OK",
              onPress: () => setIsLoading(false),
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error initiating subscription:", error);
      handlePurchaseError(error as Error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="bg-primary-100 h-full">
        <View className="flex-1">
          {/* Header */}
          <View className="px-5 pt-5 pb-2 border-b border-primary-300">
            <View className="relative flex-row justify-center items-center">
              <TouchableOpacity
                onPress={onClose}
                className="p-2 absolute left-0"
              >
                <Ionicons name="close-outline" size={24} color="#fff" />
              </TouchableOpacity>
              <Text className="text-white text-lg font-bold">
                Suscripción Premium
              </Text>
            </View>
          </View>
          <ScrollView className="flex-1 px-5">
            {/* Hero Section */}
            <View className="items-center mt-5">
              <Text className="text-white text-2xl font-bold text-center mb-3">
                Sincroniza tus Datos en la Nube
              </Text>
              <Text className="text-neutral-200 text-center text-base leading-6">
                Mantén tus gastos seguros y accesibles desde cualquier
                dispositivo
              </Text>
            </View>

            {/* Subscription Plans */}
            <View className="mt-4">
              <Text className="text-white text-xl font-bold text-center">
                Elige tu plan
              </Text>
              <View className="flex-col gap-4 mt-4">
                {subscriptionPlans.map((plan) => (
                  <TouchableOpacity
                    key={plan.id}
                    className={`p-5 rounded-2xl border-2 relative overflow-hidden ${
                      selectedPlan === plan.id
                        ? "border-accent-200 bg-accent-200/10"
                        : "border-primary-300 bg-primary-200/50"
                    }`}
                    onPress={() => setSelectedPlan(plan.id)}
                  >
                    {plan.popular && (
                      <View className="absolute top-1 right-1 bg-gradient-to-r from-accent-200 to-orange-400 px-4 py-1 rounded-full">
                        <Text className="text-white text-xs font-bold">
                          ¡Más Popular!
                        </Text>
                      </View>
                    )}

                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <Text className="text-white text-xl font-bold mb-1">
                          {plan.title}
                        </Text>
                        <Text className="text-neutral-300 text-sm">
                          {plan.description}
                        </Text>
                      </View>
                      <View className="items-end ml-4">
                        <Text className="text-2xl font-bold text-white">
                          {plan.price}
                        </Text>
                        <Text className="text-neutral-300 text-sm">
                          {plan.period}
                        </Text>
                      </View>
                    </View>

                    <View className="mt-2">
                      {plan.features.map((feature, idx) => (
                        <View key={idx} className="flex-row items-center">
                          <Text className="text-accent-200 text-sm mr-2">
                            •
                          </Text>
                          <Text className="text-neutral-200 text-sm flex-1">
                            {feature}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {selectedPlan === plan.id && (
                      <View className="absolute top-1 right-1">
                        <View className="w-6 h-6 bg-accent-200 rounded-full items-center justify-center">
                          <Text className="text-white text-xs font-bold">
                            ✓
                          </Text>
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
          {/* Bottom Actions */}
          <View className="px-5 pb-5 border-t border-primary-300/50 pt-5 bg-primary-100">
            <TouchableOpacity
              className={`py-4 rounded-xl mb-4 ${
                isLoading ? "bg-neutral-600" : "bg-accent-200"
              }`}
              onPress={() => handleSubscription(selectedPlan)}
              disabled={isLoading}
              style={{
                shadowColor: isLoading ? "#666" : "#FF6B35",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isLoading ? 0.2 : 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              {isLoading ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator size="small" color="#fff" />
                  <Text className="text-white text-lg font-bold ml-2">
                    Procesando...
                  </Text>
                </View>
              ) : (
                <Text className="text-white text-lg font-bold text-center">
                  Comenzar con{" "}
                  {subscriptionPlans.find((p) => p.id === selectedPlan)?.title}
                </Text>
              )}
            </TouchableOpacity>
            {/* Security Badge */}
            <View className="flex-row items-center justify-center mb-3">
              <Text className="text-green-400 text-sm mr-2">🔒</Text>
              <Text className="text-neutral-300 text-sm font-medium">
                Pago 100% seguro y encriptado
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-neutral-400 text-xs text-center leading-4">
                • Cancela en cualquier momento, sin compromiso a largo plazo
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default SubscriptionModal;
