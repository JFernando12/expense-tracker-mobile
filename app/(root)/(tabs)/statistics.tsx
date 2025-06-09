import Header from '@/components/Header';
import { CategoryDistribution, SummaryCards } from '@/components/statistics';
import {
  CategoryExpenseData,
  ExtendedCategoryData,
} from '@/constants/interfaces';
import { useGlobalContext } from '@/lib/global-provider';
import { useTranslation } from '@/lib/i18n/useTranslation';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Statistics = () => {
  const {
    totalIncomesSevenDays,
    totalExpensesSevenDays,
    totalIncomesThirtyDays,
    totalExpensesThirtyDays,
    totalIncomes,
    totalExpenses,
    categoryExpensesSevenDays,
    categoryExpensesThirtyDays,
    categoryExpensesYear,
    isOnlineMode,
  } = useGlobalContext();

  const { t } = useTranslation();
  const [categoryData, setCategoryData] = useState<ExtendedCategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<
    '7days' | '30days' | 'total'
  >('7days');
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
      value: item.total,
      text: `${item.percentage.toFixed(1)}%`,
      name: item.categoryName,
    }));
  };

  useEffect(() => {
    let currentData: CategoryExpenseData[] = [];
    let currentLoading = false;
    let incomes: number | null = null;
    let expenses: number | null = null;

    switch (selectedPeriod) {
      case '7days':
        currentData = categoryExpensesSevenDays || [];
        currentLoading = isOnlineMode ? false : false; // Local mode doesn't have loading states for statistics
        incomes = totalIncomesSevenDays;
        expenses = totalExpensesSevenDays;
        break;
      case '30days':
        currentData = categoryExpensesThirtyDays || [];
        currentLoading = isOnlineMode ? false : false;
        incomes = totalIncomesThirtyDays;
        expenses = totalExpensesThirtyDays;
        break;
      case 'total':
        currentData = categoryExpensesYear || [];
        currentLoading = isOnlineMode ? false : false;
        incomes = totalIncomes;
        expenses = totalExpenses;
        break;
    }

    setLoading(currentLoading);
    setCategoryData(transformCategoryData(currentData));
    setCurrentTotalIncomes(incomes);
    setCurrentTotalExpenses(expenses);
  }, [
    selectedPeriod,
    categoryExpensesSevenDays,
    categoryExpensesThirtyDays,
    categoryExpensesYear,
    isOnlineMode,
    totalIncomesSevenDays,
    totalExpensesSevenDays,
    totalIncomesThirtyDays,
    totalExpensesThirtyDays,
    totalIncomes,
    totalExpenses,
  ]);
  const handleSegmentChange = (label: string) => {
    let period: '7days' | '30days' | 'total';
    switch (label) {
      case t('statistics.sevenDays'):
        period = '7days';
        break;
      case t('statistics.thirtyDays'):
        period = '30days';
        break;
      case t('statistics.total'):
        period = 'total';
        break;
      default:
        period = '7days';
    }
    setSelectedPeriod(period);
  };

  return (
    <SafeAreaView className="bg-primary-100 h-full p-5 -pb-safe-offset-20">
      {/* Header */}
      <Header title='statistics.title' />
      {/* Segmented Control */}
      <View className="mt-3">
        <SegmentedControl
          values={[
            t('statistics.sevenDays'),
            t('statistics.thirtyDays'),
            t('statistics.total'),
          ]}
          selectedIndex={
            selectedPeriod === '7days' ? 0 : selectedPeriod === '30days' ? 1 : 2
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
            {t('statistics.expensesByCategory')}
          </Text>
          <CategoryDistribution categoryData={categoryData} loading={loading} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Statistics;
