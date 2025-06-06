import SuscriptionModal from '@/components/SuscriptionModal';
import { useGlobalContext } from '@/lib/global-provider';
import { Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const RootLayout = () => {
  const { userLoading, subscriptionModal, closeSubscriptionModal } =
    useGlobalContext();

  if (userLoading) {
    return (
      <SafeAreaView className="bg-white h-full flex justify-center items-center">
        <ActivityIndicator className="text-primary-300 " size="large" />
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
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
            presentation: 'modal',
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
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="(modals)/walletModal/create"
          options={{
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="(modals)/loginModal"
          options={{
            presentation: 'modal',
          }}
        />
      </Stack>
      <SuscriptionModal
        visible={subscriptionModal.visible}
        onClose={closeSubscriptionModal}
        userData={subscriptionModal.registrationUserData}
      />
    </View>
  );
};

export default RootLayout;
