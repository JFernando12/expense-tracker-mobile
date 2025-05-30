import {
  CategoryDistribution,
  SpendingTrends,
  SummaryCards,
  WalletDistribution,
} from '@/components/statistics';
import { useGlobalContext } from '@/lib/global-provider';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { router } from 'expo-router';
import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Statistics = () => {
  const { user, totalIncomes, totalExpenses } = useGlobalContext();

  const handleSegmentChange = (label: string) => {};

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
    <SafeAreaView className="bg-primary-100 h-full p-5 -pb-safe-offset-20">
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

      {/* Segmented Control */}
      <View className="mt-8">
        <SegmentedControl
          values={['Semanal', 'Mensual', 'Anual']}
          selectedIndex={0}
          onChange={(event) => handleSegmentChange(event.nativeEvent.value)}
          tintColor="#18C06A"
          fontStyle={{ color: 'white' }}
        />
      </View>
      <ScrollView
        className="flex-1 mt-4 rounded-t-xl"
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Cards */}
        <View>
          <SummaryCards
            totalExpenses={totalExpenses}
            totalIncomes={totalIncomes}
          />
        </View>

        {/* Bar Chart */}
        {/* <StatisticsChart
          data={data}
          stepValue={stepValue}
          maxValue={maxValue}
          yAxisLabelTexts={yAxisLabelTexts}
        /> */}

        {/* Category Distribution */}
        <View className="mt-6">
          <CategoryDistribution categoryData={categoryData} />
        </View>

        {/* Spending Trends */}
        <View className="mt-6">
          <SpendingTrends />
        </View>

        {/* Wallet Distribution */}
        <View className="mt-6 mb-10">
          <WalletDistribution walletData={walletData} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Statistics;
