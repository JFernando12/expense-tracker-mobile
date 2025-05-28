import { Redirect, Stack } from "expo-router";
import React from "react";

const RootLayout = () => {
  const isLogin = true;

  if (!isLogin) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="(modals)/searchModal"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="(modals)/profileModal"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="(modals)/transactionModal/[id]"
        options={{
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="(modals)/transactionModal/create"
        options={{
          presentation: "modal",
        }}
      />
    </Stack>
  );
};

export default RootLayout;
