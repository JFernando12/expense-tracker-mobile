import icons from "@/constants/icons";
import { useGlobalContext } from "@/lib/global-provider";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { updateSyncMode } from "@/lib/services/user/user";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImagePropsBase,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const DataSettings = () => {
  const {
    userLocal,
    refetchUserLocal,
    openSubscriptionModal,
    refetchSyncedData,
    syncDataLoading,
  } = useGlobalContext();
  const syncMode = userLocal?.syncMode || "local";
  const appMode = userLocal?.appMode || "free";
  const { t } = useTranslation();
  const formatLastSyncDate = (date?: Date) => {
    if (!date) return t("common.never");

    const now = new Date();
    const lastSync = new Date(date);
    const diffInMinutes = Math.floor(
      (now.getTime() - lastSync.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return t("common.justNow");
    if (diffInMinutes < 60)
      return t("common.minutesAgo", {
        count: diffInMinutes,
        s: diffInMinutes > 1 ? "s" : "",
      });

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24)
      return t("common.hoursAgo", {
        count: diffInHours,
        s: diffInHours > 1 ? "s" : "",
      });

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7)
      return t("common.daysAgo", {
        count: diffInDays,
        s: diffInDays > 1 ? "s" : "",
      });

    return lastSync.toLocaleDateString();
  };

  const handleAutoSyncToggle = async () => {
    if (!userLocal?.isLoggedIn) {
      router.push("/(root)/(modals)/loginModal");
      return;
    }

    // Cloud sync requires premium subscription
    if (appMode !== "premium") {
      openSubscriptionModal();
      return;
    }

    try {
      const autoSyncMode = syncMode === "cloud" ? true : false;
      Alert.alert(
        "Auto Sync Mode",
        `You are about to ${
          autoSyncMode ? "deactivate" : "activate"
        } auto sync mode`,
        [
          {
            text: t("common.cancel"),
            style: "cancel",
          },
          {
            text: "Confirm",
            onPress: async () => {
              await updateSyncMode({
                syncMode: autoSyncMode ? "local" : "cloud",
              });
              await refetchUserLocal();
            },
          },
        ],
        { cancelable: true }
      );
    } catch {
      Alert.alert(t("common.failed"), t("profile.cloudSyncRequiresPremium"));
    }
  };

  const handleSyncData = async () => {
    if (!userLocal?.isLoggedIn) {
      router.push("/(root)/(modals)/loginModal");
      return;
    }

    if (appMode !== "premium") {
      openSubscriptionModal();
      return;
    }

    try {
      // Alert with confirmation or cancel
      Alert.alert(
        t("profile.syncData"),
        "You are about to sync your data with the cloud",
        [
          {
            text: t("common.cancel"),
            style: "cancel",
          },
          {
            text: "Confirm",
            onPress: async () => {
              await refetchSyncedData();
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      Alert.alert(t("common.failed"), "Failed to sync data");
    }
  };

  return (
    <View className="mt-4">
      <Text className="text-neutral-500 text-sm font-medium uppercase tracking-widest mb-3">
        {t("profile.dataSettings")}
      </Text>
      {/* Last Sync Info */}
      <View className="mb-3 px-4 py-3 bg-secondary-100/80 rounded-xl border border-secondary-100">
        <View className="flex-row items-center">
          <View className="bg-blue-500/20 size-8 rounded-full items-center justify-center mr-3">
            <Image
              source={icons.calendar as ImagePropsBase}
              tintColor="#3b82f6"
              className="size-4"
            />
          </View>
          <View className="flex-1">
            <Text className="text-neutral-500 text-xs font-medium uppercase tracking-wider mb-1">
              Last Sync
            </Text>
            <Text className="text-white text-sm font-medium">
              {formatLastSyncDate(userLocal?.lastSyncDate)}
            </Text>
          </View>
        </View>
      </View>
      {/* Combined Data Settings Card */}
      <View className="bg-secondary-100 rounded-2xl overflow-hidden">
        {/* Auto Sync Data */}
        <View className="p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-white text-lg font-medium">
                {t("profile.automaticCloudSync")}
              </Text>
              {appMode === "free" && (
                <Text className="text-neutral-400 text-sm">
                  {t("profile.premiumFeatureRequired")}
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => handleAutoSyncToggle()}
              className={`w-12 h-6 rounded-full p-0.5 ${
                syncMode === "cloud" ? "bg-green-500" : "bg-neutral-600"
              }`}
            >
              <View
                className="w-5 h-5 rounded-full bg-white"
                style={{
                  transform: [{ translateX: syncMode === "cloud" ? 24 : 0 }],
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
        {/* Divider */}
        <View className="h-px bg-neutral-700 mx-4" />
        {/* Sync Data */}
        <View className="p-4">
          <TouchableOpacity
            onPress={handleSyncData}
            className="flex-row items-center justify-between"
            activeOpacity={0.7}
            disabled={syncDataLoading}
          >
            <View className="flex-1">
              <Text className="text-white text-lg font-medium">
                {t("profile.syncData")}
              </Text>
              <Text className="text-neutral-400 text-sm">
                {!userLocal?.isLoggedIn
                  ? "Login required to sync data"
                  : appMode === "free"
                  ? "Premium feature required"
                  : syncDataLoading
                  ? "Syncing data..."
                  : "Get latest data from server"}
              </Text>
            </View>
            <View className="bg-blue-500/20 size-10 rounded-full items-center justify-center">
              {syncDataLoading ? (
                <ActivityIndicator size="small" color="#3b82f6" />
              ) : (
                <Image
                  source={icons.rightArrow as ImagePropsBase}
                  tintColor="#3b82f6"
                  className="size-5"
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default DataSettings;
