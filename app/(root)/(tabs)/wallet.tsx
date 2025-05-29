import WalletList from "@/components/WalletList";
import { getWallets } from '@/lib/appwrite';
import { useAppwrite } from '@/lib/useAppwrite';
import { router } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Wallet = () => {
  const { data: wallets, loading: walletsLoading } = useAppwrite({
    fn: getWallets,
    params: {},
  });

  return (
    <SafeAreaView className="bg-black h-full -pb-safe-offset-20">
      <View className="flex-col items-center justify-between py-16">
        <Text className="text-white text-3xl font-extrabold">$9,000.00</Text>
        <Text className="text-white">Balance total</Text>
      </View>
      <View className="flex-1 bg-gray-800 p-7 rounded-t-3xl">
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-2xl font-bold">My Wallet</Text>
          <TouchableOpacity
            onPress={() => router.push('/(root)/(modals)/walletModal/create')}
          >
            <Text className="text-white">Crear</Text>
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
