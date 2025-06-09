import { useGlobalContext } from "@/lib/global-provider";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const SubscriptionStatus = () => {
  const { userLocal, openSubscriptionModal } = useGlobalContext();
  const { t } = useTranslation();
  const { appMode, subscriptionType } = userLocal || {};

  const handleUpgrade = () => {
    if (!userLocal?.isLoggedIn) {
      router.push("/(root)/(modals)/loginModal");
      return;
    }
    openSubscriptionModal();
  };

  const getStatusColor = () => {
    if (appMode === "free") return "text-neutral-400";
    return "text-green-400";
  };
  const getStatusText = () => {
    if (appMode === "free") return t("subscription.freeMode");

    if (subscriptionType === "monthly") return t("subscription.monthlyPlan");
    if (subscriptionType === "yearly") return t("subscription.yearlyPlan");
    return t("subscription.premium");
  };
  const getStatusDescription = () => {
    if (appMode === "free") {
      return t("subscription.upgradeDescription");
    }
    return t("subscription.premiumDescription");
  };

  return (
    <View className="bg-secondary-100 rounded-2xl p-4">
      {/* Status Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View
            className={`size-3 rounded-full mr-3 ${
              appMode === "premium" ? "bg-green-400" : "bg-neutral-400"
            }`}
          />
          <Text className={`text-lg font-bold ${getStatusColor()}`}>
            {getStatusText()}
          </Text>
        </View>
        {appMode === "premium" && (
          <View className="bg-accent-200/20 px-2 py-1 rounded-full">
            <Text className="text-accent-200 text-xs font-bold">
              {t("subscription.premium").toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Status Description */}
      <Text className="text-neutral-300 text-sm mb-4">
        {getStatusDescription()}
      </Text>

      {/* Action Buttons */}
      <View className="space-y-2">
        {appMode === "free" && (
          <TouchableOpacity
            onPress={handleUpgrade}
            className="bg-accent-200 py-3 px-4 rounded-xl"
          >
            <Text className="text-white text-center font-bold">
              {t("subscription.upgradeToPremium")}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default SubscriptionStatus;
