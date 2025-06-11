import icons from '@/constants/icons';
import { useGlobalContext } from '@/lib/global-provider';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { router } from 'expo-router';
import React from 'react';
import {
  Image,
  ImagePropsBase,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const AccountSettings = () => {
  const { userLocal } = useGlobalContext();

  const { t } = useTranslation();
  const handleLoginToSync = () => {
    router.push('/(root)/(modals)/loginModal');
  };

  return (
    <View className="mt-4">
      <Text className="text-neutral-500 text-sm font-medium uppercase tracking-widest mb-3">
        {t('profile.accountSettings')}
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
              {t('profile.personalInformation')}
            </Text>
            {!userLocal?.isLoggedIn && (
              <Text className="text-neutral-400 text-base">
                {t('profile.loginBackupPrompt')}
              </Text>
            )}
          </View>
          <View className="ml-3">
            <Image
              source={icons.rightArrow as ImagePropsBase}
              tintColor="#6b7280"
              className="size-5"
            />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default AccountSettings;
