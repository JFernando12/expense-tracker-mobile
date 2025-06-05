import icons from '@/constants/icons';
import images from '@/constants/images';
import { logout } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { clearLocalData } from '@/lib/services/syncData/clearData';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Profile = () => {
  const { user, refetchUser, isLoggedIn, isOnlineMode } = useGlobalContext();
  const { t } = useTranslation();
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const handleLogout = async () => {
    const result = await logout();
    if (!result) {
      Alert.alert(t('common.failed'), t('profile.logoutFailed'));
      return;
    }
    await refetchUser();
    Alert.alert(t('common.success'), t('profile.logoutSuccess'));
  };

  const handleLoginToSync = () => {
    router.push('/(root)/(modals)/loginModal');
  };

  const handleAutoSyncToggle = (value: boolean) => {
    setAutoSyncEnabled(value);
    if (value) {
      Alert.alert(
        t('profile.autoSyncEnabled'),
        'Auto sync has been enabled. Your data will sync automatically when connected to the internet.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        t('profile.autoSyncDisabled'),
        'Auto sync has been disabled. You can still manually sync your data.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView className="bg-primary-100 h-full">
      {/* Header Section */}
      <View className="px-6 pt-12 pb-8">
        {/* Profile Avatar */}
        <View className="items-center mb-6">
          <View className="relative">
            <View className="size-28 rounded-full overflow-hidden bg-secondary-100 border border-neutral-500 items-center justify-center">
              {isLoggedIn && user?.avatar ? (
                <Image source={{ uri: user.avatar }} className="size-20" />
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
            {isLoggedIn ? user?.name || 'User' : t('profile.localUser')}
          </Text>
          <Text className="text-neutral-400 text-base">
            All your spending in one place
          </Text>
        </View>
      </View>

      {/* Content Section */}
      <View className="flex-1 px-6">
        {/* Account Settings Section */}
        <View className="mb-6">
          <Text className="text-neutral-500 text-sm font-medium uppercase tracking-widest mb-3">
            ACCOUNT SETTINGS
          </Text>

          {/* Personal Information Card */}
          <TouchableOpacity
            onPress={
              isLoggedIn
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
                <Text className="text-neutral-400 text-base">
                  Sign in to sync your data
                </Text>
              </View>
              <View className="ml-3">
                <Image
                  source={icons.rightArrow as ImageSourcePropType}
                  tintColor="#6b7280"
                  className="size-6"
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Data Settings Section */}
        <View className="mb-6">
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
                    Auto Sync Data
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleAutoSyncToggle(!autoSyncEnabled)}
                  className={`w-12 h-6 rounded-full p-0.5 ${
                    autoSyncEnabled ? 'bg-green-500' : 'bg-neutral-600'
                  }`}
                >
                  <View
                    className="w-5 h-5 rounded-full bg-white"
                    style={{
                      transform: [{ translateX: autoSyncEnabled ? 24 : 0 }],
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Divider */}
            <View className="h-px bg-neutral-700 mx-4" />

            {/* Delete Data */}
            <TouchableOpacity
              onPress={() => clearLocalData()}
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
                    className="size-4"
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer spacing */}
        <View className="h-12" />
      </View>
    </SafeAreaView>
  );
};

export default Profile;
