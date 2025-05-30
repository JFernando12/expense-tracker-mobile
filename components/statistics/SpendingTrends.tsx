import React from 'react';
import { Text, View } from 'react-native';

const SpendingTrends = () => {
  return (
    <View className="mt-8">
      <Text className="text-white text-2xl font-bold mb-4">Tendencias</Text>
      <View className="bg-primary-300 rounded-xl p-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-neutral-200">Mayor gasto</Text>
          <Text className="text-white font-bold">Food & Dining</Text>
        </View>
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-neutral-200">Día con más gastos</Text>
          <Text className="text-white font-bold">Viernes</Text>
        </View>
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-neutral-200">Categoría creciente</Text>
          <View className="flex-row items-center">
            <Text className="text-white font-bold mr-2">
              Transportation
            </Text>
            <Text className="text-danger">↑ 18%</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default SpendingTrends;
