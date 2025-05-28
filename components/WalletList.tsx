import { wallets } from '@/constants/wallets';
import React from 'react';
import { ScrollView } from 'react-native';
import WalletItem from './WalletItem';

const WalletList = () => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="mt-5 rounded-lg"
    >
      {wallets.map((wallet, index) => (
        <WalletItem
          key={index}
          walletId={wallet.id}
          name={wallet.name}
          amount={wallet.amount}
        />
      ))}
    </ScrollView>
  );
};

export default WalletList;
