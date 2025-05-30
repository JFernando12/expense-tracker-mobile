import { Wallet } from '@/types/types';
import React from 'react';
import { ScrollView, View } from 'react-native';
import WalletItem from './WalletItem';

const WalletList = ({ wallets }: { wallets: Wallet[] }) => {
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
