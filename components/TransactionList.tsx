import { Transaction } from '@/types/types';
import React from 'react';
import { ScrollView } from 'react-native';
import TransactionItem from './TransactionItem';

const TransactionList = ({ transactions }: { transactions: Transaction[] }) => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="mt-5 rounded-lg"
    >
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
    </ScrollView>
  );
};

export default TransactionList;
