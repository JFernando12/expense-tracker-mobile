import { useGlobalContext } from '@/lib/global-provider';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { register } from '../lib/appwrite';

const Register = () => {
  const { refetchUser, refetchResources } = useGlobalContext();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    // Basic validation
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    // Email validation using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const success = await register(email, password, name);

      if (success) {
        await refetchUser();
        await refetchResources(); // Fetch all resources after registration
        router.replace('/(root)/(tabs)');
      } else {
        Alert.alert(
          'Registration Error',
          'Failed to register. Please try again.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="bg-black h-full p-5">
      <View className="mt-20">
        <Text className="text-4xl font-bold text-white">Let&apos;s</Text>
        <Text className="text-4xl font-bold text-white">Get Started</Text>
      </View>
      <View className="mt-10">
        <Text className="text-white">
          Create an account to track your expenses
        </Text>
      </View>
      <View className="mt-5 flex-col gap-5">
        <View className="border border-white rounded-xl py-4">
          <TextInput
            className="ml-5 text-white"
            placeholder="Enter your name"
            placeholderTextColor="gray"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>
        <View className="border border-white rounded-xl py-4">
          <TextInput
            className="ml-5 text-white"
            placeholder="Enter your email"
            placeholderTextColor="gray"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View className="border border-white rounded-xl py-4">
          <TextInput
            className="ml-5 text-white"
            placeholder="Enter your password"
            placeholderTextColor="gray"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>
      </View>
      <TouchableOpacity
        className="mt-10 bg-white flex-row justify-center items-center py-4 rounded-3xl"
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <Text className="text-2xl font-extrabold">Register</Text>
        )}
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
