import { AccountSettings } from "@/components/profile";
import icons from "@/constants/icons";
import images from "@/constants/images";
import { useGlobalContext } from "@/lib/global-provider";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { deleteAccount, logout } from "@/lib/services/user/user";
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
  const { userLocal, refetchUserLocal, isNetworkEnabled } = useGlobalContext();

  const { t } = useTranslation();
  const initials = userLocal?.name
    ?.split(" ")
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
  const handleLogout = async () => {
    Alert.alert(
      t("profile.logoutConfirmTitle"),
      t("profile.logoutConfirmMessage"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("profile.confirm"),
          onPress: async () => {
            const result = await logout({ networkEnabled: isNetworkEnabled });
            if (!result) {
              Alert.alert(t("common.failed"), t("profile.logoutFailed"));
              return;
            }
            await refetchUserLocal();
          },
        },
      ],
      { cancelable: true }
    );
  };
  const handleDeleteAccount = async () => {
    Alert.alert(
      t("profile.deleteAccountConfirmTitle"),
      t("profile.deleteAccountConfirmMessage"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            const result = await deleteAccount({
              networkEnabled: isNetworkEnabled,
            });
            if (!result) {
              Alert.alert(t("common.failed"), t("profile.deleteAccountFailed"));
              return;
            }
            await refetchUserLocal();
          },
        },
      ],
      { cancelable: true }
    );
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
          {/* Account Settings Section */}
          <AccountSettings />
          {/* Data Settings Section */}
          {/* Account Actions Section */}
          {userLocal?.isLoggedIn && (
            <View className="mt-4">
              <Text className="text-neutral-500 text-sm font-medium uppercase tracking-widest mb-3">
                {t("profile.accountActions")}
              </Text>
              {/* Logout Button */}
              <TouchableOpacity
                onPress={handleLogout}
                className="bg-secondary-100 rounded-2xl p-4 mb-3"
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
              {/* Delete Account Button */}
              <TouchableOpacity
                onPress={handleDeleteAccount}
                className="bg-secondary-100 rounded-2xl p-4"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="bg-red-600/20 size-10 rounded-full items-center justify-center mr-3">
                      <Image
                        source={icons.trashCan as ImageSourcePropType}
                        tintColor="#dc2626"
                        className="size-6"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-red-500 text-lg font-medium mb-0.5">
                        {t("profile.deleteAccount")}
                      </Text>
                      <Text className="text-neutral-400 text-sm">
                        {t("profile.deleteAccountDescription")}
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
