import TransactionList from '@/components/TransactionList';
import icons from '@/constants/icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Image,
  ImagePropsBase,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SearchModal = () => {
  return (
    <SafeAreaView className="bg-black h-full p-5">
      <View className="relative flex-row items-center justify-center mb-5">
        <TouchableOpacity
          className="absolute left-0 p-2"
          onPress={() => router.push('/')}
        >
          <Image
            source={icons.backArrow as ImagePropsBase}
            className="size-9"
            tintColor="white"
          />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Search</Text>
      </View>
      <View className="flex-row">
        <TextInput
          className="flex-1 bg-gray-800 text-white p-5 rounded-lg"
          placeholder="Search transactions..."
          placeholderTextColor="gray"
        />
      </View>
      <View className="mt-5 flex-1">
        <TransactionList />
      </View>
    </SafeAreaView>
  );
};

export default SearchModal;
