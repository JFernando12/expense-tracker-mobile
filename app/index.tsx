import { useGlobalContext } from '@/lib/global-provider';
import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Index = () => {
  const { userLocalLoading } = useGlobalContext();

  if (userLocalLoading) {
    return (
      <SafeAreaView className="bg-primary-100 h-full flex justify-center items-center">
        <ActivityIndicator className="text-primary-300" size="large" />
      </SafeAreaView>
    );
  }

  return <Redirect href="/(root)/(tabs)" />;
};

export default Index;
