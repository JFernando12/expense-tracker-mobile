import { Wallet } from '@/types/types';
import React from 'react';
import { ScrollView } from 'react-native';
import WalletItem from './WalletItem';

const WalletList = ({ wallets }: { wallets: Wallet[] }) => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="mt-5 rounded-lg"
    >
      {wallets.map((wallet, index) => (
        <WalletItem
          key={index}
          id={wallet.id}
          name={wallet.name}
          currentBalance={wallet.currentBalance}
        />
      ))}
    </ScrollView>
  );
};

export default WalletList;
