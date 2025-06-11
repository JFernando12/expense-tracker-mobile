import Header from '@/components/Header';
import WalletList from '@/components/WalletList';
import { useGlobalContext } from '@/lib/global-provider';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { formatNumberWithCommas } from '@/lib/utils/numberUtils';
import { router } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Wallet = () => {
  const { wallets, totalBalance } = useGlobalContext();
  const { t } = useTranslation();

  return (
    <SafeAreaView className="bg-primary-100 h-full p-5 -pb-safe-offset-20">
      {/* Header */}
      <Header title="wallet.title" />
      {/* Balance Section */}
      <View className="mt-3 flex-col items-center justify-between">
        <Text className="text-neutral-200 text-lg">
          {t('wallet.totalBalance')}
        </Text>
        <Text className="text-white text-4xl font-bold">
          $
          {totalBalance
            ? formatNumberWithCommas(totalBalance.toFixed(2))
            : '0.00'}
        </Text>
      </View>
      <View className="flex-1 mt-5 rounded-t-3xl">
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-xl font-bold">
            {t('wallet.allAccounts')}
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(root)/(modals)/walletModal/create')}
            className="bg-accent-200 rounded-full px-4 py-2"
          >
            <Text className="text-white font-medium">{t('wallet.create')}</Text>
          </TouchableOpacity>
        </View>

        {/* Wallets */}
        <View className="flex-1 mt-4">
          <WalletList wallets={wallets || []} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Wallet;
