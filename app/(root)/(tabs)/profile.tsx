import SubscriptionStatus from "@/components/SubscriptionStatus";
import icons from "@/constants/icons";
import images from "@/constants/images";
import { useGlobalContext } from "@/lib/global-provider";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { logout, updateSyncMode } from "@/lib/services/user/user";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  ImageSourcePropType,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const {
    userLocal,
    refetchUserLocal,
    isNetworkEnabled,
    openSubscriptionModal,
    refetchSyncedData,
  } = useGlobalContext();
  const { t } = useTranslation();
  const syncMode = userLocal?.syncMode || "local";
  const appMode = userLocal?.appMode || "free";
  const initials = userLocal?.name
    ?.split(" ")
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  const formatLastSyncDate = (date?: Date) => {
    if (!date) return "Never";

    const now = new Date();
    const lastSync = new Date(date);
    const diffInMinutes = Math.floor(
      (now.getTime() - lastSync.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60)
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7)
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;

    return lastSync.toLocaleDateString();
  };

  const handleLogout = async () => {
    const result = await logout({ networkEnabled: isNetworkEnabled });
    if (!result) {
      Alert.alert(t("common.failed"), t("profile.logoutFailed"));
      return;
    }
    await refetchUserLocal();
    Alert.alert(t("common.success"), t("profile.logoutSuccess"));
  };

  const handleLoginToSync = () => {
    router.push("/(root)/(modals)/loginModal");
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
      const value = syncMode === "local" ? "cloud" : "local";
      await updateSyncMode({ syncMode: value });
      await refetchUserLocal();
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
      await refetchSyncedData();
      Alert.alert(t("common.success"), "Data synced successfully");
    } catch (error) {
      Alert.alert(t("common.failed"), "Failed to sync data");
    }
  };

  return (
    <SafeAreaView className="bg-primary-100 h-full -p-safe-offset-20">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="mt-8">
          {/* Profile Avatar */}
          <View className="items-center mb-4">
            <View className=" flex items-center justify-center size-28 rounded-full bg-secondary-100 border border-neutral-500">
              {userLocal?.isLoggedIn && userLocal?.name ? (
                <Text
                  className="text-white text-5xl font-bold text-center"
                  style={{ lineHeight: 72, includeFontPadding: false }}
                >
                  {initials}
                </Text>
              ) : (
                <Image
                  source={images.avatar as ImageSourcePropType}
                  className="size-16"
                  tintColor={"#6b7280"}
                />
              )}
            </View>
          </View>
          {/* Profile Name */}
          <View className="items-center">
            <Text className="text-white text-2xl font-bold mb-1">
              {userLocal?.isLoggedIn ? userLocal?.name : t("profile.localUser")}
            </Text>
            <Text className="text-neutral-400 text-base">
              {t("profile.tagline")}
            </Text>
          </View>
        </View>

        {/* Content Section */}
        <View className="flex-1 px-6 mt-4">
          {/* Subscription Status */}
          <SubscriptionStatus />
          {/* Account Settings Section */}
          <View className="mt-4">
            <Text className="text-neutral-500 text-sm font-medium uppercase tracking-widest mb-3">
              {t("profile.accountSettings")}
            </Text>
            {/* Personal Information Card */}
            <TouchableOpacity
              onPress={
                userLocal?.isLoggedIn
                  ? () => router.push("/(root)/(modals)/profileModal")
                  : handleLoginToSync
              }
              className="bg-secondary-100 rounded-2xl p-4"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-white text-lg font-medium mb-0.5">
                    {t("profile.personalInformation")}
                  </Text>
                  {!userLocal?.isLoggedIn && (
                    <Text className="text-neutral-400 text-base">
                      {t("profile.loginBackupPrompt")}
                    </Text>
                  )}
                </View>
                <View className="ml-3">
                  <Image
                    source={icons.rightArrow as ImageSourcePropType}
                    tintColor="#6b7280"
                    className="size-5"
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
          {/* Data Settings Section */}
          <View className="mt-4">
            <Text className="text-neutral-500 text-sm font-medium uppercase tracking-widest mb-3">
              {t("profile.dataSettings")}
            </Text>
            {/* Last Sync Info */}
            <View className="mb-3 px-4 py-3 bg-secondary-100/80 rounded-xl border border-secondary-100">
              <View className="flex-row items-center">
                <View className="bg-blue-500/20 size-8 rounded-full items-center justify-center mr-3">
                  <Image
                    source={icons.calendar as ImageSourcePropType}
                    tintColor="#3b82f6"
                    className="size-4"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-neutral-500 text-xs font-medium uppercase tracking-wider mb-1">
                    Last Sync
                  </Text>
                  <Text className="text-white text-sm font-medium">
                    {!userLocal?.isLoggedIn
                      ? "Login required to sync"
                      : appMode === "free"
                      ? "Premium feature required"
                      : syncMode === "local"
                      ? "Cloud sync disabled"
                      : formatLastSyncDate(userLocal?.lastSyncDate)}
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
                      {t("profile.secureCloudSync")}
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
                        transform: [
                          { translateX: syncMode === "cloud" ? 24 : 0 },
                        ],
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
                >
                  <View className="flex-1">
                    <Text className="text-white text-lg font-medium">
                      {t("profile.syncData") || "Sync Data"}
                    </Text>
                    <Text className="text-neutral-400 text-sm">
                      {!userLocal?.isLoggedIn
                        ? "Login required to sync data"
                        : appMode === "free"
                        ? "Premium feature required"
                        : "Refresh all data from server"}
                    </Text>
                  </View>
                  <View className="bg-blue-500/20 size-10 rounded-full items-center justify-center">
                    <Image
                      source={icons.rightArrow as ImageSourcePropType}
                      tintColor="#3b82f6"
                      className="size-5"
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          {/* Account Actions Section */}
          {userLocal?.isLoggedIn && (
            <View className="mt-4">
              <Text className="text-neutral-500 text-sm font-medium uppercase tracking-widest mb-3">
                {t("profile.accountActions")}
              </Text>
              {/* Logout Button */}
              <TouchableOpacity
                onPress={handleLogout}
                className="bg-secondary-100 rounded-2xl p-4"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="bg-red-500/20 size-10 rounded-full items-center justify-center mr-3">
                      <Image
                        source={icons.logout as ImageSourcePropType}
                        tintColor="#ef4444"
                        className="size-6"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white text-lg font-medium mb-0.5">
                        {t("profile.logout")}
                      </Text>
                    </View>
                  </View>
                  <View className="ml-3">
                    <Image
                      source={icons.rightArrow as ImageSourcePropType}
                      tintColor="#6b7280"
                      className="size-5"
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
