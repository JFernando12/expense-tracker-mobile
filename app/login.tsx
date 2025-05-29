import { useGlobalContext } from '@/lib/global-provider';
import { Redirect, router } from 'expo-router';
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
import { login } from '../lib/appwrite';

const Login = () => {
  const { refetchUser, refetchResources, loading, isLoggedIn } = useGlobalContext();

  if (!loading && isLoggedIn) return <Redirect href="/" />;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // Basic validation
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(email, password);

      if (success) {
        await refetchUser();
        await refetchResources(); // Fetch all resources after login
      } else {
        Alert.alert(
          'Login Failed',
          'Invalid email or password. Please try again.'
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
        <Text className="text-4xl font-bold text-white">Hey,</Text>
        <Text className="text-4xl font-bold text-white">Welcome back!</Text>
      </View>
      <View className="mt-10">
        <Text className="text-white">Login now to track all your expenses</Text>
      </View>
      <View className="mt-5 flex-col gap-5">
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
      <TouchableOpacity className="mt-3 flex-row justify-end">
        <Text className="text-white">Forgot Password?</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="mt-10 bg-white flex-row justify-center items-center py-4 rounded-3xl"
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <Text className="text-2xl font-extrabold">Login</Text>
        )}
      </TouchableOpacity>
      <View className="mt-10 flex-row justify-center items-center gap-2">
        <Text className="text-white">Don&apos;t have an account?</Text>
        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text className="text-green-500 font-extrabold">Register</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Login;
