import { transactions } from '@/constants/transactions';
import React from 'react';
import { ScrollView } from 'react-native';
import TransactionItem from './TransactionItem';

const TransactionList = () => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="mt-5 rounded-lg"
    >
      {transactions.map((transaction, index) => (
        <TransactionItem
          transactionId={transaction.id}
          key={index}
          category={transaction.category}
          description={transaction.description}
          amount={transaction.amount}
          isIncome={transaction.isIncome}
          date={transaction.date}
        />
      ))}
    </ScrollView>
  );
};

export default TransactionList;
