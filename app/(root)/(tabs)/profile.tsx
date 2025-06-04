import SectionButton from '@/components/SectionButton';
import icons from '@/constants/icons';
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

  const sections = [
    {
      title: t('profile.editProfile'),
      onPress: () => router.push('/(root)/(modals)/profileModal'),
      icon: icons.person,
      iconBgColor: 'bg-accent-200',
      needLogin: true,
    },
    {
      title: isSyncing ? t('profile.syncing') : 'Auto Sync Data',
      onPress: isSyncing ? () => {} : undefined,
      icon: icons.wifi,
      iconBgColor: isSyncing ? 'bg-black-200' : 'bg-accent-200',
      showLoading: isSyncing,
      showToggle: !isSyncing,
      showArrow: false,
      toggleValue: autoSyncEnabled,
      onToggleChange: handleLoginToSync,
      needLogin: false,
    },
    {
      title: t('profile.deleteData'),
      onPress: () => clearLocalData(),
      icon: icons.trashCan,
      iconBgColor: 'bg-danger-100',
      needLogin: false,
    },
    {
      title: t('profile.logout'),
      onPress: handleLogout,
      icon: icons.logout,
      iconBgColor: 'bg-danger-100',
      needLogin: true,
    },
  ];

  return (
    <SafeAreaView className="bg-primary-100 h-full">
      {/* Header Section */}
      <View className="bg-primary-200 px-5 pt-4 pb-8">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-white text-2xl font-bold">Profile</Text>
          <TouchableOpacity className="bg-white/20 rounded-full p-2">
            <Text className="text-white text-lg">⚙️</Text>
          </TouchableOpacity>
        </View>
        {/* Profile Info */}
        <View className="items-center">
          <View className="size-24 rounded-full overflow-hidden mb-4 bg-white/20 items-center justify-center border-4 border-white/30">
            {isLoggedIn && user?.avatar ? (
              <Image source={{ uri: user.avatar }} className="h-full w-full" />
            ) : (
              <Text className="text-3xl">👤</Text>
            )}
          </View>
          <Text className="text-white text-xl font-bold mb-1">
            {isLoggedIn ? user?.name || 'User' : t('profile.localUser')}
          </Text>
          <Text className="text-neutral-200 text-base">
            {isLoggedIn && user?.email ? user.email : 'Welcome to your profile'}
          </Text>
        </View>
      </View>
      {/* Content Section */}
      <View className="flex-1 px-4 -mt-4">
        {/* Personal Information Card */}
        <View className="bg-secondary-100 rounded-xl p-4 mb-4">
          <TouchableOpacity
            onPress={
              isLoggedIn
                ? () => router.push('/(root)/(modals)/profileModal')
                : handleLoginToSync
            }
            className="flex-row items-center justify-between"
            activeOpacity={0.7}
          >
            <View>
              <Text className="text-white text-lg font-semibold mb-1">
                Personal Information
              </Text>
              <Text className="text-neutral-200 text-sm">
                {isLoggedIn
                  ? 'Update your profile details'
                  : 'Log in to sync your data'}
              </Text>
            </View>
            <View className="bg-accent-200 size-10 rounded-full items-center justify-center">
              <Image
                source={icons.rightArrow as ImageSourcePropType}
                tintColor="white"
                className="size-4"
              />
            </View>
          </TouchableOpacity>
        </View>
        {/* Menu Items */}
        <View className="space-y-1">
          {sections
            .filter((section) => !section.needLogin || isLoggedIn)
            .map((section, index) => (
              <SectionButton
                key={index}
                onPress={section.onPress}
                icon={section.icon}
                className="bg-secondary-100 p-4 rounded-xl mb-2"
                iconBgColor={section.iconBgColor}
                showLoading={section.showLoading || false}
                showToggle={section.showToggle || false}
                showArrow={section.showArrow !== false}
                toggleValue={section.toggleValue || false}
                onToggleChange={section.onToggleChange}
              >
                {section.title}
              </SectionButton>
            ))}
        </View>
        {/* Footer spacing */}
        <View className="h-8" />
      </View>
    </SafeAreaView>
  );
};

export default Profile;
