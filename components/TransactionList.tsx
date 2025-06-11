import images from '@/constants/images';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Transaction } from '@/types/types';
import React from 'react';
import { Image, ImagePropsBase, ScrollView, Text, View } from 'react-native';
import TransactionItem from './TransactionItem';

const TransactionList = ({ transactions }: { transactions: Transaction[] }) => {
  const { t } = useTranslation();

  if (transactions.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-primary-300 p-6 mb-4 rounded-3xl shadow-lg">
        <Image
          source={images.noResult as ImagePropsBase}
          className="w-32 h-32 mb-4"
          resizeMode="contain"
        />
        <Text className="text-white text-lg font-bold mb-2">
          {t('home.noTransactions')}
        </Text>
        <Text className="text-neutral-200 text-sm text-center">
          {t('home.noTransactionsDescription')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="rounded-t-xl">
      <View className="space-y-1">
        {transactions.map((transaction, index) => (
          <TransactionItem
            id={transaction.id}
            key={index}
            walletId={transaction.walletId}
            categoryId={transaction.categoryId}
            description={transaction.description}
            amount={transaction.amount}
            type={transaction.type}
            date={transaction.date}
            updatedAt={transaction.updatedAt}
            imageUrl={transaction.imageUrl}
          />
        ))}
      </View>
      <View className="pb-7" />
    </ScrollView>
  );
};

export default TransactionList;
