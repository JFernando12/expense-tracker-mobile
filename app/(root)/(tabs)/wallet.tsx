import WalletList from '@/components/WalletList';
import { useGlobalContext } from '@/lib/global-provider';
import { router } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Wallet = () => {
  const { wallets, totalBalance, user } = useGlobalContext();

  return (
    <SafeAreaView className="bg-primary-100 h-full p-5 -pb-safe-offset-14">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-white text-2xl font-bold">My Wallet</Text>
        <TouchableOpacity
          onPress={() => router.push('/(root)/(modals)/profileModal')}
          className="h-12 w-12 rounded-full overflow-hidden bg-accent-200"
        >
          <Image source={{ uri: user?.avatar }} className="h-full w-full" />
        </TouchableOpacity>
      </View>

      {/* Balance Section */}
      <View className="flex-col items-center justify-between">
        <Text className="text-neutral-200 text-lg">Total Balance</Text>
        <Text className="text-white text-4xl font-bold">
          ${totalBalance?.toFixed(2)}
        </Text>
      </View>
      <View className="flex-1 mt-5 rounded-t-3xl">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-white text-xl font-bold">All Accounts</Text>
          <TouchableOpacity
            onPress={() => router.push('/(root)/(modals)/walletModal/create')}
            className="bg-accent-200 rounded-full px-4 py-2"
          >
            <Text className="text-white font-medium">Add</Text>
          </TouchableOpacity>
        </View>
        {/* Wallets */}
        <View className="flex-1">
          <WalletList wallets={wallets || []} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Wallet;
