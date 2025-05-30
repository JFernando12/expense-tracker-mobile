import React from 'react';
import { Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

type CategoryData = {
  value: number;
  color: string;
  text: string;
  name: string;
};

type CategoryDistributionProps = {
  categoryData: CategoryData[];
};

const CategoryDistribution = ({ categoryData }: CategoryDistributionProps) => {
  return (
    <View>
      <Text className="text-white text-xl font-bold mb-4">
        Distribución por Categoría
      </Text>
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
              <View className="flex-row items-center">
                <View
                  className="w-4 h-4 rounded-sm mr-3"
                  style={{ backgroundColor: item.color }}
                />
                <Text className="text-white font-normal">{item.name}</Text>
              </View>
              <Text className="text-white font-medium">{item.text}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default CategoryDistribution;
