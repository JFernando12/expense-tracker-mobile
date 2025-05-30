import {
  CategoryDistribution,
  SpendingTrends,
  StatisticsChart,
  SummaryCards,
  WalletDistribution,
} from '@/components/statistics';
import {
  statisticsMonth,
  statisticsWeek,
  statisticsYear,
} from '@/constants/statistics';
import { useGlobalContext } from '@/lib/global-provider';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const statisticsTypes = [
  {
    label: 'Semanal',
    data: statisticsWeek,
    maxValue: 6000,
    stepValue: 1000,
    yAxisLabelTexts: ['0', '1k', '2k', '3k', '4k', '5k', '6k'],
  },
  {
    label: 'Mensual',
    data: statisticsMonth,
    maxValue: 20000,
    stepValue: 5000,
    yAxisLabelTexts: ['0', '5k', '10k', '15k', '20k'],
  },
  {
    label: 'Anual',
    data: statisticsYear,
    maxValue: 100000,
    stepValue: 20000,
    yAxisLabelTexts: ['0', '20k', '40k', '60k', '80k', '100k'],
  },
];

const Statistics = () => {
  const { user, totalIncomes, totalExpenses } = useGlobalContext();

  const [data, setData] = useState(statisticsTypes[0].data);
  const [maxValue, setMaxValue] = useState(statisticsTypes[0].maxValue);
  const [stepValue, setStepValue] = useState(statisticsTypes[0].stepValue);
  const [yAxisLabelTexts, setYAxisLabelTexts] = useState(
    statisticsTypes[0].yAxisLabelTexts
  );

  const handleSegmentChange = (label: string) => {
    const selectedType = statisticsTypes.find((type) => type.label === label);
    if (selectedType) {
      setData(selectedType.data);
      setMaxValue(selectedType.maxValue);
      setStepValue(selectedType.stepValue);
      setYAxisLabelTexts(selectedType.yAxisLabelTexts);
    }
  };

  // Sample category data based on expense categories from README
  const categoryData = [
    { value: 30, color: '#f59e0b', text: '30%', name: 'Food & Dining' },
    { value: 20, color: '#3b82f6', text: '20%', name: 'Transportation' },
    { value: 15, color: '#ec4899', text: '15%', name: 'Shopping' },
    { value: 12, color: '#8b5cf6', text: '12%', name: 'Entertainment' },
    { value: 10, color: '#ef4444', text: '10%', name: 'Bills & Utilities' },
    { value: 8, color: '#10b981', text: '8%', name: 'Healthcare' },
    { value: 5, color: '#84cc16', text: '5%', name: 'Personal Care' },
  ];

  // Sample wallet data
  const walletData = [
    { name: 'Efectivo', balance: 1250, color: '#f59e0b', percentage: '25%' },
    { name: 'Banco', balance: 2500, color: '#3b82f6', percentage: '50%' },
    { name: 'Ahorros', balance: 1250, color: '#ec4899', percentage: '25%' },
  ];

  return (
    <SafeAreaView className="bg-primary-100 h-full p-5 -pb-safe-offset-14">
      {/* Header */}
      <View className="flex-row items-center justify-start">
        <Text className="text-white text-2xl font-bold">Estadísticas</Text>
        <TouchableOpacity
          onPress={() => router.push('/(root)/(modals)/profileModal')}
          className="absolute right-0 top-0 size-12 rounded-full overflow-hidden bg-accent-200"
        >
          <Image source={{ uri: user?.avatar }} className="h-full w-full" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="mt-8">
          <View>
            <SegmentedControl
              values={['Semanal', 'Mensual', 'Anual']}
              selectedIndex={0}
              onChange={(event) => handleSegmentChange(event.nativeEvent.value)}
              backgroundColor="#192A3A"
              tintColor="#18C06A"
              fontStyle={{ color: 'white' }}
            />
          </View>

          {/* Summary Cards */}
          <SummaryCards
            totalExpenses={totalExpenses}
            totalIncomes={totalIncomes}
          />

          {/* Bar Chart */}
          <StatisticsChart
            data={data}
            stepValue={stepValue}
            maxValue={maxValue}
            yAxisLabelTexts={yAxisLabelTexts}
          />
        </View>

        {/* Category Distribution */}
        <CategoryDistribution categoryData={categoryData} />

        {/* Spending Trends */}
        <SpendingTrends />

        {/* Wallet Distribution */}
        <WalletDistribution walletData={walletData} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Statistics;
