import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

type CategoryData = {
  value: number;
  color: string;
  text: string;
  name: string;
};

type CategoryDistributionProps = {
  categoryData: CategoryData[];
  loading?: boolean;
};

const CategoryDistribution = ({ categoryData, loading = false }: CategoryDistributionProps) => {
  if (loading) {
    return (
      <View className="bg-primary-300 p-5 rounded-xl">
        <View className="items-center py-8">
          <ActivityIndicator size="large" color="#18C06A" />
          <Text className="text-white text-center mt-4">
            Cargando datos de categorías...
          </Text>
        </View>
      </View>
    );
  }

  if (!categoryData || categoryData.length === 0) {
    return (
      <View className="bg-primary-300 p-5 rounded-xl">
        <Text className="text-white text-center py-8">
          No hay datos de categorías disponibles
        </Text>
      </View>
    );
  }

  return (
    <View>
      <View className="bg-primary-300 p-5 rounded-xl">
        <View className="items-center">
          <PieChart data={categoryData} donut innerRadius={0} />
        </View>

        <View className="mt-5">
          {categoryData.map((item, index) => (
            <View
              key={index}
              className="flex-row justify-between items-center mb-3"
            >
              <View className="flex-row items-center flex-1">
                <View
                  className="w-4 h-4 rounded-sm mr-3"
                  style={{ backgroundColor: item.color }}
                />
                <Text className="text-white font-normal flex-1" numberOfLines={1}>
                  {item.name}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-white font-medium mr-2">
                  ${item.value.toFixed(2)}
                </Text>
                <Text className="text-neutral-300 font-medium">
                  {item.text}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default CategoryDistribution;
