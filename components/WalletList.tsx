import icons from '@/constants/icons';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Wallet } from '@/types/types';
import { router } from 'expo-router';
import React from 'react';
import {
  Image,
  ImagePropsBase,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import WalletItem from './WalletItem';

const WalletList = ({ wallets }: { wallets: Wallet[] }) => {
  const { t } = useTranslation();

  if (wallets.length === 0) {
    return (
      <View className="items-center mt-16">
        <View className="bg-secondary-200 size-20 rounded-full items-center justify-center mb-6">
          <Image
            source={icons.wallet as ImagePropsBase}
            className="size-10"
            tintColor="white"
          />
        </View>
        <Text className="text-white text-xl font-bold mb-2">
          {t('alerts.createFirstWallet')}
        </Text>
        <Text className="text-neutral-200 text-center text-base mb-8 px-6">
          {t('alerts.createFirstWalletMessage')}
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(root)/(modals)/walletModal/create')}
          className="bg-accent-200 rounded-xl px-8 py-4"
        >
          <Text className="text-white font-bold text-lg">
            {t('wallet.create')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="rounded-t-xl">
      {wallets.map((wallet, index) => (
        <WalletItem
          key={index}
          id={wallet.id}
          name={wallet.name}
          currentBalance={wallet.currentBalance}
        />
      ))}
      <View className="pb-7" />
    </ScrollView>
  );
};

export default WalletList;
