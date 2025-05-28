import { router } from 'expo-router';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Register = () => {
  return (
    <SafeAreaView className="bg-black h-full p-5">
      <View className="mt-20">
        <Text className="text-4xl font-bold text-white">Let's</Text>
        <Text className="text-4xl font-bold text-white">Get Started</Text>
      </View>
      <View className="mt-10">
        <Text className="text-white">
          Create and account to track your expenses
        </Text>
      </View>
      <View className="mt-5 flex-col gap-5">
        <View className="border border-white rounded-xl py-4">
          <TextInput
            className="ml-5 text-white"
            placeholder="Enter your name"
            placeholderTextColor="gray"
          />
        </View>
        <View className="border border-white rounded-xl py-4">
          <TextInput
            className="ml-5 text-white"
            placeholder="Enter your email"
            placeholderTextColor="gray"
          />
        </View>
        <View className="border border-white rounded-xl py-4">
          <TextInput
            className="ml-5 text-white"
            placeholder="Enter your email"
            placeholderTextColor="gray"
          />
        </View>
      </View>
      <TouchableOpacity className="mt-10 bg-white flex-row justify-center items-center py-4 rounded-3xl">
        <Text className="text-2xl font-extrabold">Register</Text>
      </TouchableOpacity>
      <View className="mt-10 flex-row justify-center items-center gap-2">
        <Text className="text-white">Already have an account?</Text>
        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text className="text-green-500 font-extrabold">Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Register;
