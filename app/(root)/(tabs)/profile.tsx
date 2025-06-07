import SubscriptionStatus from '@/components/SubscriptionStatus';
import icons from '@/constants/icons';
import images from '@/constants/images';
import { useGlobalContext } from '@/lib/global-provider';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { clearLocalData } from '@/lib/services/syncData/clearData';
import { logout, updateSyncMode } from '@/lib/services/user/user';
import { router } from 'expo-router';
import React from 'react';
import {
  Alert,
  Image,
  ImageSourcePropType,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Profile = () => {
  const {
    userLocal,
    refetchUserLocal,
    isOnlineMode,
    isNetworkEnabled,
    openSubscriptionModal,
  } = useGlobalContext();
  const syncMode = userLocal?.syncMode || 'local';

  const { appMode } = userLocal || {};
  const { t } = useTranslation();

  const handleLogout = async () => {
    const result = await logout({ networkEnabled: isNetworkEnabled });
    if (!result) {
      Alert.alert(t('common.failed'), t('profile.logoutFailed'));
      return;
    }
    await refetchUserLocal();
    Alert.alert(t('common.success'), t('profile.logoutSuccess'));
  };

  const handleLoginToSync = () => {
    router.push('/(root)/(modals)/loginModal');
  };

  const handleAutoSyncToggle = async () => {
    if (!userLocal?.isLoggedIn) {
      router.push('/(root)/(modals)/loginModal');
      return;
    }

    // Cloud sync requires premium subscription
    if (appMode !== 'premium') {
      openSubscriptionModal();
      return;
    }

    try {
      const value = syncMode === 'local' ? 'cloud' : 'local';
      await updateSyncMode({ syncMode: value });
      await refetchUserLocal();
    } catch (error) {
      Alert.alert(
        t('common.failed'),
        'Cloud sync requires premium subscription'
      );
    }
  };

  return (
    <SafeAreaView className="bg-primary-100 h-full -p-safe-offset-20">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="mt-8">
          {/* Profile Avatar */}
          <View className="items-center mb-4">
            <View className="relative">
              <View className="size-28 rounded-full overflow-hidden bg-secondary-100 border border-neutral-500 items-center justify-center">
                {userLocal?.isLoggedIn && userLocal?.name ? (
                  <Text className="text-white text-4xl font-bold">
                    {userLocal.name.charAt(0).toUpperCase()}
                  </Text>
                ) : (
                  <Image
                    source={images.avatar as ImageSourcePropType}
                    className="size-16"
                    tintColor={'#6b7280'}
                  />
                )}
              </View>
            </View>
          </View>
          {/* Profile Name */}
          <View className="items-center">
            <Text className="text-white text-2xl font-bold mb-1">
              {userLocal?.isLoggedIn ? userLocal?.name : t('profile.localUser')}
            </Text>
            <Text className="text-neutral-400 text-base">
              All your spending in one place
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
              ACCOUNT SETTINGS
            </Text>

            {/* Personal Information Card */}
            <TouchableOpacity
              onPress={
                userLocal?.isLoggedIn
                  ? () => router.push('/(root)/(modals)/profileModal')
                  : handleLoginToSync
              }
              className="bg-secondary-100 rounded-2xl p-4"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-white text-lg font-medium mb-0.5">
                    Personal Information
                  </Text>
                  {!userLocal?.isLoggedIn && (
                    <Text className="text-neutral-400 text-base">
                      Log in to back up your expenses
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
              DATA SETTINGS
            </Text>

            {/* Combined Data Settings Card */}
            <View className="bg-secondary-100 rounded-2xl overflow-hidden">
              {/* Auto Sync Data */}
              <View className="p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-white text-lg font-medium">
                      Secure Cloud Sync
                    </Text>
                    {appMode === 'free' && (
                      <Text className="text-neutral-400 text-sm">
                        Premium feature - upgrade required
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleAutoSyncToggle()}
                    className={`w-12 h-6 rounded-full p-0.5 ${
                      syncMode === 'cloud' ? 'bg-green-500' : 'bg-neutral-600'
                    }`}
                  >
                    <View
                      className="w-5 h-5 rounded-full bg-white"
                      style={{
                        transform: [
                          { translateX: syncMode === 'cloud' ? 24 : 0 },
                        ],
                      }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              {/* Divider */}
              <View className="h-px bg-neutral-700 mx-4" />
              {/* Delete Data */}
              <TouchableOpacity
                onPress={() => {
                  clearLocalData();
                }}
                className="p-4"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="bg-red-500/20 size-10 rounded-full items-center justify-center mr-3">
                      <Image
                        source={icons.trashCan as ImageSourcePropType}
                        tintColor="#ef4444"
                        className="size-6"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white text-lg font-medium mb-0.5">
                        {t('profile.deleteData')}
                      </Text>
                      <Text className="text-neutral-400 text-base">
                        This will erase all local information
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
          </View>

          {/* Account Actions Section */}
          {userLocal?.isLoggedIn && (
            <View className="mt-4">
              <Text className="text-neutral-500 text-sm font-medium uppercase tracking-widest mb-3">
                ACCOUNT ACTIONS
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
                        {t('profile.logout')}
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
