import { useTranslatedCategories } from '@/constants/categories';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

const CategoryIconDemo = () => {
  const categories = useTranslatedCategories();

  return (
    <ScrollView className="flex-1 bg-primary-100 p-4">
      <Text className="text-white text-2xl font-bold mb-6 text-center">
        Categories with Ionicons
      </Text>
      
      <View className="space-y-4">
        <Text className="text-white text-xl font-semibold mb-2">Expense Categories</Text>
        <View className="flex-row flex-wrap gap-4">
          {categories
            .filter(category => category.type === 'expense')
            .map((category) => (
              <View 
                key={category.id} 
                className="bg-secondary-100 p-4 rounded-xl items-center min-w-[100px] flex-1"
              >
                <View className="bg-danger-100 rounded-full p-3 mb-2">
                  <Ionicons
                    name={category.icon}
                    size={24}
                    color="white"
                  />
                </View>
                <Text className="text-white text-sm font-medium text-center">
                  {category.name}
                </Text>
              </View>
            ))}
        </View>

        <Text className="text-white text-xl font-semibold mb-2 mt-6">Income Categories</Text>
        <View className="flex-row flex-wrap gap-4">
          {categories
            .filter(category => category.type === 'income')
            .map((category) => (
              <View 
                key={category.id} 
                className="bg-secondary-100 p-4 rounded-xl items-center min-w-[100px] flex-1"
              >
                <View className="bg-accent-200 rounded-full p-3 mb-2">
                  <Ionicons
                    name={category.icon}
                    size={24}
                    color="white"
                  />
                </View>
                <Text className="text-white text-sm font-medium text-center">
                  {category.name}
                </Text>
              </View>
            ))}
        </View>
      </View>

      <View className="mt-8 bg-secondary-100 p-4 rounded-xl">
        <Text className="text-white text-lg font-semibold mb-2">
          Implementation Features:
        </Text>
        <Text className="text-neutral-200 mb-1">
          ✅ Ionicons integration with @expo/vector-icons
        </Text>
        <Text className="text-neutral-200 mb-1">
          ✅ Translation support with useTranslation hook
        </Text>
        <Text className="text-neutral-200 mb-1">
          ✅ Type-safe category definitions
        </Text>
        <Text className="text-neutral-200 mb-1">
          ✅ Backward compatibility with existing code
        </Text>
        <Text className="text-neutral-200">
          ✅ Reactive to language changes
        </Text>
      </View>
    </ScrollView>
  );
};

export default CategoryIconDemo;
