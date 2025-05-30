import React from 'react';
import { Text, View } from 'react-native';

type WalletData = {
  name: string;
  balance: number;
  color: string;
  percentage: string;
};

type WalletDistributionProps = {
  walletData: WalletData[];
};

const WalletDistribution = ({ walletData }: WalletDistributionProps) => {
  // Calculate total balance
  const totalBalance = walletData.reduce(
    (sum, wallet) => sum + wallet.balance,
    0
  );

  return (
    <View className="mt-8 mb-5">
      <Text className="text-white text-2xl font-bold mb-4">
        Distribución por Billetera
      </Text>
      <View className="bg-primary-300 p-4 rounded-xl">
        {walletData.map((wallet, index) => (
          <View
            key={index}
            className="flex-row justify-between items-center mb-3"
          >
            <View className="flex-row items-center">
              <View
                className="w-3 h-3 rounded-sm mr-2"
                style={{ backgroundColor: wallet.color }}
              />
              <Text className="text-white">{wallet.name}</Text>
            </View>
            <View className="flex-row">
              <Text className="text-white mr-3">${wallet.balance}</Text>
              <Text className="text-neutral-200">{wallet.percentage}</Text>
            </View>
          </View>
        ))}
        <View className="h-[1px] bg-primary-200 my-3" />
        <View className="flex-row justify-between items-center">
          <Text className="text-white font-bold">Total</Text>
          <Text className="text-white font-bold">${totalBalance.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
};

export default WalletDistribution;
