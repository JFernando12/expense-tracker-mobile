import React from 'react';
import { Text, View } from 'react-native';

type SummaryCardsProps = {
  totalExpenses: number | undefined | null;
  totalIncomes: number | undefined | null;
};

const SummaryCards = ({ totalExpenses, totalIncomes }: SummaryCardsProps) => {
  return (
    <View className="flex-row justify-between">
      <View className="bg-primary-300 p-4 rounded-xl w-[48%]">
        <Text className="text-neutral-200 text-base">Gastos</Text>
        <Text className="text-danger font-bold text-xl">
          ${totalExpenses ? totalExpenses.toFixed(2) : '0.00'}
        </Text>
        <View className="flex-row items-center mt-1">
          <Text className="text-danger text-xs">↑ 12%</Text>
          <Text className="text-neutral-200 text-xs ml-1">vs anterior</Text>
        </View>
      </View>
      <View className="bg-primary-300 p-4 rounded-xl w-[48%]">
        <Text className="text-neutral-200 text-base">Ingresos</Text>
        <Text className="text-white text-xl font-bold">
          ${totalIncomes ? totalIncomes.toFixed(2) : '0.00'}
        </Text>
        <View className="flex-row items-center mt-1">
          <Text className="text-accent-200 text-xs">↑ 8%</Text>
          <Text className="text-neutral-200 text-xs ml-1">vs anterior</Text>
        </View>
      </View>
    </View>
  );
};

export default SummaryCards;
