import { useGlobalContext } from '@/lib/global-provider';
import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const RootLayout = () => {
  const { loading, isLoggedIn } = useGlobalContext();

  if (loading) {
    return (
      <SafeAreaView className="bg-white h-full flex justify-center items-center">
        <ActivityIndicator className="text-primary-300 " size="large" />
      </SafeAreaView>
    );
  }

  if (!isLoggedIn) return <Redirect href="/login" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="(modals)/searchModal"
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="(modals)/profileModal"
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="(modals)/transactionModal/[id]"
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="(modals)/transactionModal/create"
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="(modals)/walletModal/[id]"
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="(modals)/walletModal/create"
        options={{
          presentation: 'modal',
        }}
      />
    </Stack>
  );
};

export default RootLayout;
