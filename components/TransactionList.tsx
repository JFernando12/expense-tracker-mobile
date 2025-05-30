import { Transaction } from '@/types/types';
import React from 'react';
import { ScrollView, View } from 'react-native';
import TransactionItem from './TransactionItem';

const TransactionList = ({ transactions }: { transactions: Transaction[] }) => {
  return (
    <ScrollView showsVerticalScrollIndicator={false} className="rounded-t-xl">
      <View className="space-y-1">
        {transactions.map((transaction, index) => (
          <TransactionItem
            id={transaction.id}
            key={index}
            category={transaction.category}
            description={transaction.description}
            amount={transaction.amount}
            type={transaction.type}
            date={transaction.date}
          />
        ))}
      </View>
      <View className="pb-7" />
    </ScrollView>
  );
};

export default TransactionList;
