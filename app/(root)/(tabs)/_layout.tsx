import icons from "@/constants/icons";
import { useGlobalContext } from "@/lib/global-provider";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { router, Tabs } from "expo-router";
import React from "react";
import { Alert, Image, ImagePropsBase, TouchableOpacity, View } from "react-native";

const LayoutTabs = () => {
  const { wallets } = useGlobalContext();
  const { t } = useTranslation();

  // Function to render the custom add button in the middle of the tab bar
  const renderAddButton = () => {
    const handleAddPress = () => {      // If there is no wallet, show an alert to create one first
      if (!wallets || wallets.length === 0) {
        Alert.alert(
          t('alerts.createFirstAccount'),
          t('alerts.createFirstAccountMessage'),
          [
            {
              text: t('common.continue'),
              onPress: () => router.push("/(root)/(modals)/walletModal/create"),
            },
          ]
        );
        return;
      };

      // Navigate to the create transaction modal
      router.push("/(root)/(modals)/transactionModal/create");
    }
    return (
      <TouchableOpacity
        onPress={handleAddPress}
        style={{
          top: -20,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View className="size-16 bg-accent-200 text-white rounded-full items-center justify-center shadow-lg">
          <Image
            source={icons.plus as ImagePropsBase}
            className="size-8"
            tintColor="white"
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#0061FF",
        tabBarInactiveTintColor: "#A3A3A3",
        tabBarStyle: {
          backgroundColor: "#111827", // Dark background to match the app's theme
          borderTopColor: "#1E293B",
          borderTopWidth: 1,
          minHeight: 70,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Image
              source={icons.home as ImagePropsBase}
              className="size-6"
              tintColor={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: t("tabs.statistics"),
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Image
              source={icons.report as ImagePropsBase}
              className="size-6"
              tintColor={color}
            />
          ),
        }}
      />
      {/* Add a hidden tab for the center button */}
      <Tabs.Screen
        name="add"
        options={{
          title: "",
          tabBarButton: renderAddButton,
        }}
        listeners={{
          tabPress: (e) => {
            // Prevent default action (navigation to tab)
            e.preventDefault();
            // Navigate to create transaction modal
            router.push("/(root)/(modals)/transactionModal/create");
          },
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: t("tabs.wallet"),
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Image
              source={icons.wallet as ImagePropsBase}
              className="size-6"
              tintColor={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Image
              source={icons.person as ImagePropsBase}
              className="size-6"
              tintColor={color}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default LayoutTabs;
