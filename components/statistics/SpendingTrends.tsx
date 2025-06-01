import React from 'react';
import { Text, View } from 'react-native';

const SpendingTrends = () => {
  return (
    <View>
      <View className="bg-primary-300 rounded-xl p-4 flex-col gap-3">
        <View className="flex-row justify-between items-center">
          <Text className="text-neutral-200">Mayor gasto</Text>
          <Text className="text-white font-bold">Food & Dining</Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-neutral-200">Día con más gastos</Text>
          <Text className="text-white font-bold">Viernes</Text>
        </View>
      </View>
    </View>
  );
};

export default SpendingTrends;
