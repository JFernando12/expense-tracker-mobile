import icons from '@/constants/icons';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { formatNumberWithCommas } from '@/lib/utils/numberUtils';
import React from 'react';
import { Image, ImagePropsBase, Text, View } from 'react-native';

type SummaryCardsProps = {
  totalExpenses: number | undefined | null;
  totalIncomes: number | undefined | null;
  period?: '7days' | '30days' | 'total';
};

const SummaryCards = ({
  totalExpenses,
  totalIncomes,
  period,
}: SummaryCardsProps) => {
  const { t } = useTranslation();

  const getPeriodText = () => {
    switch (period) {
      case '7days':
        return t('periods.last7Days');
      case '30days':
        return t('periods.last30Days');
      case 'total':
        return t('periods.totalAccumulated');
      default:
        return t('periods.thisPeriod');
    }
  };

  return (
    <View className="flex-row justify-between">
      <View className="bg-primary-300 p-4 rounded-xl w-[48%] flex-row items-center justify-between">
        <View>
          <Text className="text-neutral-200 text-base">{t('home.income')}</Text>
          <Text className="text-white text-xl font-bold">
            $
            {totalIncomes
              ? formatNumberWithCommas(totalIncomes.toFixed(2))
              : '0.00'}
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-neutral-200 text-xs">{getPeriodText()}</Text>
          </View>
        </View>
        <View className="size-8 rounded-full border-accent-200 border-2 items-center justify-center">
          <Image
            source={icons.upArrow as ImagePropsBase}
            tintColor="#18C06A"
            className="size-5"
          />
        </View>
      </View>
      <View className="bg-primary-300 p-4 rounded-xl w-[48%] flex-row items-center justify-between">
        <View>
          <Text className="text-neutral-200 text-base">
            {t('home.expenses')}
          </Text>
          <Text className="text-danger font-bold text-xl">
            $
            {totalExpenses
              ? formatNumberWithCommas(totalExpenses.toFixed(2))
              : '0.00'}
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-neutral-200 text-xs">{getPeriodText()}</Text>
          </View>
        </View>
        <View className="size-8 rounded-full border-danger border-2 items-center justify-center">
          <Image
            source={icons.downArrow as ImagePropsBase}
            tintColor="#F75555"
            className="size-5"
          />
        </View>
      </View>
    </View>
  );
};

export default SummaryCards;
