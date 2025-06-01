import { CategoryDistribution, SummaryCards } from '@/components/statistics';
import { CategoryExpenseData } from '@/lib/appwrite/index';
import { useGlobalContext } from '@/lib/global-provider';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ExtendedCategoryData extends CategoryExpenseData {
  color: string;
  value: number;
  text: string;
  name: string;
}

const Statistics = () => {
  const {
    user,
    totalIncomesWeek,
    totalExpensesWeek,
    totalIncomesMonth,
    totalExpensesMonth,
    totalIncomesYear,
    totalExpensesYear,
    categoryExpensesWeek,
    categoryExpensesMonth,
    categoryExpensesYear,
    categoryExpensesWeekLoading,
    categoryExpensesMonthLoading,
    categoryExpensesYearLoading,
  } = useGlobalContext();
  const [categoryData, setCategoryData] = useState<ExtendedCategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<
    'weekly' | 'monthly' | 'annual'
  >('weekly');
  const [currentTotalIncomes, setCurrentTotalIncomes] = useState<number | null>(
    null
  );
  const [currentTotalExpenses, setCurrentTotalExpenses] = useState<
    number | null
  >(null);

  // Transform CategoryExpenseData to ExtendedCategoryData
  const transformCategoryData = (
    data: CategoryExpenseData[]
  ): ExtendedCategoryData[] => {
    return data.map((item) => ({
      ...item,
      value: item.totalAmount,
      text: `${item.percentage.toFixed(1)}%`,
      name: item.categoryName,
    }));
  }; // Update category data when period or data changes
  useEffect(() => {
    let currentData: CategoryExpenseData[] = [];
    let currentLoading = false;
    let incomes: number | null = null;
    let expenses: number | null = null;

    switch (selectedPeriod) {
      case 'weekly':
        currentData = categoryExpensesWeek || [];
        currentLoading = categoryExpensesWeekLoading;
        incomes = totalIncomesWeek;
        expenses = totalExpensesWeek;
        break;
      case 'monthly':
        currentData = categoryExpensesMonth || [];
        currentLoading = categoryExpensesMonthLoading;
        incomes = totalIncomesMonth;
        expenses = totalExpensesMonth;
        break;
      case 'annual':
        currentData = categoryExpensesYear || [];
        currentLoading = categoryExpensesYearLoading;
        incomes = totalIncomesYear;
        expenses = totalExpensesYear;
        break;
    }

    setLoading(currentLoading);
    setCategoryData(transformCategoryData(currentData));
    setCurrentTotalIncomes(incomes);
    setCurrentTotalExpenses(expenses);
  }, [
    selectedPeriod,
    categoryExpensesWeek,
    categoryExpensesMonth,
    categoryExpensesYear,
    categoryExpensesWeekLoading,
    categoryExpensesMonthLoading,
    categoryExpensesYearLoading,
    totalIncomesWeek,
    totalExpensesWeek,
    totalIncomesMonth,
    totalExpensesMonth,
    totalIncomesYear,
    totalExpensesYear,
  ]);

  const handleSegmentChange = (label: string) => {
    let period: 'weekly' | 'monthly' | 'annual';
    switch (label) {
      case 'Semanal':
        period = 'weekly';
        break;
      case 'Mensual':
        period = 'monthly';
        break;
      case 'Anual':
        period = 'annual';
        break;
      default:
        period = 'monthly';
    }
    setSelectedPeriod(period);
  };

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
          selectedIndex={
            selectedPeriod === 'weekly'
              ? 0
              : selectedPeriod === 'monthly'
              ? 1
              : 2
          }
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
            totalExpenses={currentTotalExpenses}
            totalIncomes={currentTotalIncomes}
            period={selectedPeriod}
          />
        </View>
        {/* Expenses Category Distribution */}
        <View className="mt-6">
          <Text className="text-white text-xl font-bold mb-4">
            Gastos por Categoría
          </Text>
          <CategoryDistribution categoryData={categoryData} loading={loading} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Statistics;
