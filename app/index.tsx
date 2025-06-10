import HomeSkeleton from '@/components/skeletons/HomeSkeleton';
import { useGlobalContext } from '@/lib/global-provider';
import { Redirect } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const Index = () => {
  const { userLocalLoading } = useGlobalContext();
  if (userLocalLoading) {
    return (
      <SafeAreaView className="bg-primary-100 h-full">
        <HomeSkeleton />
      </SafeAreaView>
    );
  }

  return <Redirect href="/(root)/(tabs)" />;
};

export default Index;
