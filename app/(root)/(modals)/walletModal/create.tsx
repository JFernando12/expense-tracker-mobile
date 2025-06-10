import CustomField from "@/components/CustomField";
import icons from "@/constants/icons";
import { useGlobalContext } from "@/lib/global-provider";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { createWallet } from "@/lib/services/fetchData/wallets";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImagePropsBase,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

enum fieldTypes {
  TEXT = "text",
  NUMBER = "number",
  DATE = "date",
  SELECT = "select",
}

const WalletCreate = () => {
  const { refetchResources, isOnlineMode } = useGlobalContext();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    initialBalance: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const fields = [
    {
      label: t('modals.walletModal.nameLabel'),
      title: t('modals.walletModal.nameLabel'),
      value: formData.name,
      type: fieldTypes.TEXT,
      key: 'name',
      placeholder: t('modals.walletModal.namePlaceholder'),
    },
    {
      label: t('modals.walletModal.descriptionLabel'),
      title: t('modals.walletModal.descriptionLabel'),
      value: formData.description,
      type: fieldTypes.TEXT,
      key: 'description',
      placeholder: t('modals.walletModal.descriptionPlaceholder'),
    },
    {
      label: t('modals.walletModal.initialBalanceLabel'),
      title: t('modals.walletModal.initialBalanceLabel'),
      value: formData.initialBalance,
      type: fieldTypes.NUMBER,
      key: 'initialBalance',
      placeholder: t('modals.walletModal.initialBalancePlaceholder'),
    },
  ];

  const handleFieldChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  
  const handleCreateWallet = async () => {
    // Validate form
    if (!formData.name.trim()) {
      Alert.alert(
        t("validation.completeFields"),
        t("validation.walletNameRequired")
      );
      return;
    }

    if (!formData.initialBalance.trim()) {
      Alert.alert(
        t("validation.completeFields"),
        t("validation.initialBalanceRequired")
      );
      return;
    }

    const initialBalance = parseFloat(formData.initialBalance);
    if (isNaN(initialBalance) || initialBalance < 0) {
      Alert.alert(
        t("validation.completeFields"),
        t("validation.initialBalanceValid")
      );
      return;
    }

    setIsLoading(true);

    try {
      await createWallet({
        isOnlineMode,
        data: {
          name: formData.name,
          description: formData.description,
          initialBalance: initialBalance,
        },
      });

      // Refetch resources to update the wallet list
      await refetchResources();
      Alert.alert(t("common.success"), t("alerts.walletCreatedSuccess"), [
        {
          text: t("common.ok"),
          onPress: () => {
            router.back();
            router.push("/(root)/(tabs)/wallet");
          },
        },
      ]);
    } catch (error) {
      console.error("Error creating account:", error);
      Alert.alert(t("common.error"), t("alerts.errorCreatingWallet"));
    }
    setIsLoading(false);
  };

  return (
    <SafeAreaView className="bg-primary-100 h-full p-5">
      <View className="relative flex-row items-center justify-center mb-5">
        <TouchableOpacity
          className="absolute left-0 p-2"
          onPress={() => router.back()}
        >
          <Image
            source={icons.backArrow as ImagePropsBase}
            className="size-9"
            tintColor="white"
          />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">
          {t("modals.walletModal.createTitle")}
        </Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="rounded-3xl mb-6 shadow-lg">
          {fields.map((field, index) => (
            <CustomField
              key={index}
              label={field.label}
              title={field.title}
              value={field.value}
              type={field.type}
              placeholder={field.placeholder}
              onChangeText={(text) => {
                handleFieldChange(field.key, text);
              }}
            />
          ))}
        </View>
      </ScrollView>
      <TouchableOpacity
        className={`rounded-xl py-3 mt-5 ${
          isLoading ? "bg-gray-600" : "bg-accent-200"
        }`}
        onPress={handleCreateWallet}
        disabled={isLoading}
      >
        {isLoading ? (
          <View className="flex-row justify-center items-center">
            <ActivityIndicator size="small" color="white" />
            <Text className="text-white text-center text-lg font-bold ml-2">
              {t("modals.walletModal.saving")}
            </Text>
          </View>
        ) : (
          <Text className="text-white text-center text-lg font-bold">
            {t("modals.walletModal.save")}
          </Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default WalletCreate;
