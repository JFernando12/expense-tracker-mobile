import { transactions } from '@/data/transactions';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

const ItemTransaction = ({
  category,
  description,
  amount,
  isIncome,
  date,
}: {
  category: string;
  description: string;
  amount: string;
  isIncome: boolean;
  date: string;
}) => {
  return (
    <View className="flex-row items-center justify-between bg-gray-800 p-4 rounded-lg mb-2">
      <View>
        <Text className="text-white">{category}</Text>
        <Text className="text-gray-400">{description}</Text>
      </View>
      <View>
        <Text className={isIncome ? 'text-green-500' : 'text-red-600'}>
          {amount}
        </Text>
        <View className="flex-row items-center justify-end">
          <Text className="text-gray-400">{date}</Text>
        </View>
      </View>
    </View>
  );
};


const TransactionList = () => {
  return (
           <ScrollView
          showsVerticalScrollIndicator={false}
          className="mt-5 rounded-lg"
        >
          {transactions.map((transaction, index) => (
            <ItemTransaction
              key={index}
              category={transaction.category}
              description={transaction.description}
              amount={transaction.amount}
              isIncome={transaction.isIncome}
              date={transaction.date}
            />
          ))}
        </ScrollView>
  )
}

export default TransactionList