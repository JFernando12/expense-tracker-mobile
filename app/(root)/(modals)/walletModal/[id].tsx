import CustomField from "@/components/CustomField";
import icons from "@/constants/icons";
import { useGlobalContext } from "@/lib/global-provider";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { deleteWallet, updateWallet } from "@/lib/services/fetchData/wallets";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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

const WalletUpdate = () => {
  const { id } = useLocalSearchParams();
  const { refetchResources, wallets, isOnlineMode } = useGlobalContext();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    initialBalance: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // Find the wallet to edit
  const walletToEdit = wallets?.find((wallet) => wallet.id === id);

  useEffect(() => {
    if (walletToEdit) {
      setFormData({
        name: walletToEdit.name,
        description: walletToEdit.description,
        initialBalance: walletToEdit.initialBalance.toString(),
      });
    }
  }, [walletToEdit]);
  const fields = [
    {
      label: t("modals.walletModal.nameLabel"),
      title: t("modals.walletModal.nameLabel"),
      value: formData.name,
      type: fieldTypes.TEXT,
      key: "name",
      placeholder: t("modals.walletModal.namePlaceholder"),
    },
    {
      label: t("modals.walletModal.descriptionLabel"),
      title: t("modals.walletModal.descriptionLabel"),
      value: formData.description,
      type: fieldTypes.TEXT,
      key: "description",
      placeholder: t("modals.walletModal.descriptionPlaceholder"),
    },
    {
      label: t("modals.walletModal.initialBalanceLabel"),
      title: t("modals.walletModal.initialBalanceLabel"),
      value: formData.initialBalance,
      type: fieldTypes.NUMBER,
      key: "initialBalance",
      placeholder: t("modals.walletModal.initialBalancePlaceholder"),
    },
  ];

  const handleFieldChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  const handleUpdateWallet = async () => {
    if (!walletToEdit) {
      Alert.alert(t("common.error"), t("modals.walletModal.walletNotFound"));
      return;
    }

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
      await updateWallet({
        isOnlineMode,
        input: {
          walletId: walletToEdit.id,
          data: {
            name: formData.name,
            description: formData.description,
            initialBalance: initialBalance,
          },
        },
      });

      // Refetch resources to update the wallet list
      await refetchResources();
      Alert.alert(t("common.success"), t("alerts.walletUpdatedSuccess"), [
        {
          text: t("common.ok"),
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error updating wallet:', error);
      Alert.alert(t("common.error"), t("alerts.errorUpdatingWallet"));
    } finally {
      setIsLoading(false);
    }
  };
  const handleDelete = async () => {
    if (!walletToEdit) return;

    Alert.alert(t("alerts.deleteWallet"), t("alerts.deleteWalletConfirm"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          setIsDeleting(true);
          try {
            await deleteWallet({ isOnlineMode, walletId: walletToEdit.id });

            Alert.alert(t("common.success"), t("alerts.walletDeletedSuccess"), [
              {
                text: t("common.ok"),
                onPress: () => {
                  refetchResources();
                  router.back();
                },
              },
            ]);
          } catch (error) {
            console.error("Error deleting wallet:", error);
            Alert.alert(t("common.error"), t("alerts.errorDeletingWallet"));
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
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
          {t("modals.walletModal.editTitle")}
        </Text>
      </View>

      {!walletToEdit ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-lg">
            {t("modals.walletModal.walletNotFound")}
          </Text>
        </View>
      ) : (
        <>
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
                  onChangeText={(text) => handleFieldChange(field.key, text)}
                />
              ))}
            </View>
          </ScrollView>
          <TouchableOpacity
            className={`rounded-xl py-3 mt-5 ${
              isLoading || isDeleting ? "bg-gray-600" : "bg-accent-200"
            }`}
            onPress={handleUpdateWallet}
            disabled={isLoading || isDeleting}
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
          {/* Delete button */}
          <TouchableOpacity
            className={`rounded-xl py-3 mt-3 ${
              isDeleting || isLoading ? "bg-gray-600" : "bg-red-600"
            }`}
            onPress={handleDelete}
            disabled={isDeleting || isLoading}
          >
            {isDeleting ? (
              <View className="flex-row justify-center items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white text-center text-lg font-bold ml-2">
                  {t("modals.walletModal.deleting")}
                </Text>
              </View>
            ) : (
              <Text className="text-white text-center text-lg font-bold">
                {t("modals.walletModal.delete")}
              </Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
};

export default WalletUpdate;
