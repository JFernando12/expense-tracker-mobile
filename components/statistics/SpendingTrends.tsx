import React from 'react';
import { Text, View } from 'react-native';

interface SpendingTrendsData {
  topCategory: string;
  topCategoryAmount: number;
  highestSpendingDay?: string;
  highestSpendingMonth?: string;
  averageDaily?: number;
  period: 'weekly' | 'monthly' | 'annual';
}

interface SpendingTrendsProps {
  data: SpendingTrendsData | null;
  loading?: boolean;
  period: 'weekly' | 'monthly' | 'annual';
}

const SpendingTrends = ({
  data,
  loading = false,
  period,
}: SpendingTrendsProps) => {
  const getPeriodText = () => {
    switch (period) {
      case 'weekly':
        return 'esta semana';
      case 'monthly':
        return 'este mes';
      case 'annual':
        return 'este año';
      default:
        return 'este período';
    }
  };

  const getHighestSpendingLabel = () => {
    switch (period) {
      case 'weekly':
        return 'Día con más gastos';
      case 'monthly':
        return 'Día con más gastos';
      case 'annual':
        return 'Mes con más gastos';
      default:
        return 'Período con más gastos';
    }
  };

  const getHighestSpendingValue = () => {
    if (period === 'annual' && data?.highestSpendingMonth) {
      return data.highestSpendingMonth;
    } else if (
      (period === 'weekly' || period === 'monthly') &&
      data?.highestSpendingDay
    ) {
      return data.highestSpendingDay;
    }
    return 'No disponible';
  };

  if (loading) {
    return (
      <View className="bg-primary-300 rounded-xl p-4 flex-col gap-3">
        <Text className="text-neutral-200">Cargando tendencias...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View className="bg-primary-300 rounded-xl p-4 flex-col gap-3">
        <Text className="text-neutral-200">
          No hay datos suficientes para mostrar tendencias en {getPeriodText()}
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-primary-300 rounded-xl p-4 flex-col gap-3">
      <View className="flex-row justify-between items-center">
        <Text className="text-neutral-200">Mayor gasto {getPeriodText()}</Text>
        <Text className="text-white font-bold">{data.topCategory}</Text>
      </View>

      <View className="flex-row justify-between items-center">
        <Text className="text-neutral-200">{getHighestSpendingLabel()}</Text>
        <Text className="text-white font-bold">
          {getHighestSpendingValue()}
        </Text>
      </View>
    </View>
  );
};

export default SpendingTrends;
