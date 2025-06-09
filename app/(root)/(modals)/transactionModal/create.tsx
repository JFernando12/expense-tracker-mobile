import CustomField from "@/components/CustomField";
import { useTranslatedCategories } from "@/constants/categories";
import icons from "@/constants/icons";
import { useGlobalContext } from "@/lib/global-provider";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { createTransaction } from "@/lib/services/fetchData/transactions";
import { TransactionType } from "@/types/types";
import DateTimePicker from "@react-native-community/datetimepicker";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImagePropsBase,
  KeyboardAvoidingView,
  Platform,
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

const TransactionCreate = () => {
  const { t } = useTranslation();
  const categories = useTranslatedCategories();
  const incomeCategories = categories
    .filter((category) => category.type === "income")
    .map((category) => ({
      value: category.id,
      label: category.name,
      icon: category.icon,
    }));

  const expenseCategories = categories
    .filter((category) => category.type === "expense")
    .map((category) => ({
      value: category.id,
      label: category.name,
      icon: category.icon,
    }));

  const [transactionType, setTransactionType] = useState<"expense" | "income">(
    "expense"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  // Form state
  const [formData, setFormData] = useState({
    walletId: "",
    categoryId: "",
    description: "",
    amount: "",
    date: new Date(),
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { isOnlineMode, wallets, walletsLoading, refetchResources } =
    useGlobalContext();

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.walletId) {
      Alert.alert(t("validation.completeFields"), t("validation.selectWallet"));
      return false;
    }
    if (!formData.categoryId) {
      Alert.alert(
        t("validation.completeFields"),
        t("validation.selectCategory")
      );
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      Alert.alert(t("validation.completeFields"), t("validation.validAmount"));
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    try {
      const { granted } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        Alert.alert(
          t("alerts.permissionsRequired"),
          t("alerts.galleryPermissionMessage")
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        // Save the image to local filesystem
        const localUri = result.assets[0].uri;
        const filename = localUri.split("/").pop();
        const documentDirectory = FileSystem.documentDirectory || "";
        const destUri = documentDirectory + filename;
        try {
          await FileSystem.copyAsync({
            from: localUri,
            to: destUri,
          });
        } catch (error) {
          console.error("Error al guardar la imagen:", error);
          Alert.alert(t("common.error"), t("alerts.failedToSaveImage"));
        }
        setSelectedImage(destUri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(
        t("alerts.somethingWentWrong"),
        t("alerts.couldNotSelectImage")
      );
    }
  };

  const takePhoto = async () => {
    try {
      const { granted } = await ImagePicker.requestCameraPermissionsAsync();

      if (!granted) {
        Alert.alert(
          t("alerts.permissionsRequired"),
          t("alerts.cameraPermissionMessage")
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        // Save the image to local filesystem
        const localUri = result.assets[0].uri;
        const filename = localUri.split("/").pop();
        const documentDirectory = FileSystem.documentDirectory || "";
        const destUri = documentDirectory + filename;

        try {
          await FileSystem.copyAsync({
            from: localUri,
            to: destUri,
          });;
        } catch (error) {
          console.error("Error saving image:", error);
          Alert.alert(t("common.error"), t("alerts.failedToSaveImage"));
        }

        setSelectedImage(destUri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert(
        t("alerts.somethingWentWrong"),
        t("alerts.couldNotTakePhoto")
      );
    }
  };

  const showImagePicker = () => {
    Alert.alert(t("alerts.selectImage"), t("alerts.chooseOption"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("alerts.takePhoto"), onPress: takePhoto },
      { text: t("alerts.gallery"), onPress: pickImage },
    ]);
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await createTransaction({
        isOnlineMode,
        data: {
          walletId: formData.walletId,
          categoryId: formData.categoryId,
          description: formData.description,
          amount: parseFloat(formData.amount),
          type: transactionType as TransactionType,
          date: formData.date.toISOString(),
          imageUrl: selectedImage,
        },
      });

      await refetchResources();
      Alert.alert(
        t("common.success"),
        t("alerts.transactionCreatedSuccess"),
        [
          {
            text: t("common.ok"),
            onPress: () => {
              router.back();
              router.push("/(root)/(tabs)");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error creating transaction:", error);
      setIsSubmitting(false);
      Alert.alert(
        t("alerts.somethingWentWrong"),
        t("alerts.errorCreatingTransaction")
      );
    }
    setIsSubmitting(false);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    // For Android, date picker closes automatically after selection
    // For iOS, we need to keep it open until user manually closes it
    const isIOS = Platform.OS === "ios";
    if (!isIOS) {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setFormData((prev) => ({
        ...prev,
        date: selectedDate,
      }));
    }
  };
  const fields = [
    {
      label: "walletId",
      title: t("modals.transactionModal.walletLabel"),
      type: fieldTypes.SELECT,
      value: formData.walletId,
      options:
        wallets?.map((wallet: { name: string; id: string }) => ({
          label: wallet.name,
          value: wallet.id,
        })) || [],
    },
    {
      label: "categoryId",
      title: t("modals.transactionModal.categoryLabel"),
      type: fieldTypes.SELECT,
      value: formData.categoryId,
      options:
        transactionType === "expense" ? expenseCategories : incomeCategories,
    },
    {
      label: "date",
      title: t("modals.transactionModal.dateLabel"),
      type: fieldTypes.DATE,
      value: formData.date.toLocaleDateString(),
    },
    {
      label: "amount",
      title: t("modals.transactionModal.amountLabel"),
      type: fieldTypes.NUMBER,
      value: formData.amount,
    },
    {
      label: "description",
      title: t("modals.transactionModal.descriptionLabel"),
      type: fieldTypes.TEXT,
      value: formData.description,
    },
  ];

  const isLoading = walletsLoading;

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
          {t("modals.transactionModal.createTitle")}
        </Text>
      </View>
      <View className="mb-4">
        <SegmentedControl
          values={[
            t("modals.transactionModal.expense"),
            t("modals.transactionModal.income"),
          ]}
          selectedIndex={transactionType === "expense" ? 0 : 1}
          tintColor={transactionType === "expense" ? "#EA4335" : "#34A853"}
          onChange={(event) => {
            const selectedValue = event.nativeEvent.value;
            const newType =
              selectedValue === t("modals.transactionModal.expense")
                ? "expense"
                : "income";
            setTransactionType(newType);
            // Reset category when transaction type changes
            setFormData((prev) => ({
              ...prev,
              categoryId: "",
            }));
          }}
        />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {isLoading && !isSubmitting ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="white" />
            <Text className="text-white mt-4">
              {t("modals.transactionModal.loadingData")}
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1 rounded-t-xl"
          >
            <View className="rounded-3xl shadow-lg">
              {fields.map((field, index) => (
                <View key={index}>
                  {field.label === "date" ? (
                    <View className="py-3 px-0">
                      <Text className="text-neutral-200 text-sm mb-1">
                        {field.title}
                      </Text>
                      <TouchableOpacity
                        className="bg-primary-200 rounded-xl border border-primary-300 py-4 px-4"
                        onPress={() =>
                          setShowDatePicker(showDatePicker ? false : true)
                        }
                      >
                        <Text className="text-white text-base">
                          {field.value}
                        </Text>
                      </TouchableOpacity>
                      {showDatePicker && field.label === "date" && (
                        <DateTimePicker
                          value={formData.date}
                          mode="date"
                          display={
                            Platform.OS === "ios" ? "spinner" : "default"
                          }
                          onChange={onDateChange}
                        />
                      )}
                    </View>
                  ) : (
                    <CustomField
                      label={field.title || field.label}
                      title={field.title}
                      value={field.value}
                      type={field.type}
                      options={field.options || []}
                      onChangeText={(text) => updateField(field.label, text)}
                    />
                  )}
                </View>
              ))}
              {/* Image picker section */}
              <View className="py-3 px-0">
                <Text className="text-neutral-200 text-sm mb-1">
                  {t("modals.transactionModal.ticketLabel")}
                </Text>
                <TouchableOpacity
                  className="bg-primary-200 rounded-xl border border-primary-300 py-4 px-4 min-h-[120px] justify-center items-center"
                  onPress={showImagePicker}
                >
                  {selectedImage ? (
                    <View className="w-full items-center">
                      <Image
                        source={{ uri: selectedImage }}
                        style={{
                          maxWidth: 280,
                          maxHeight: 200,
                          width: "100%",
                          height: undefined,
                          aspectRatio: 1,
                        }}
                        className="rounded-lg"
                        resizeMode="contain"
                      />
                      <TouchableOpacity
                        className="absolute top-2 right-2 bg-red-600 rounded-full p-1"
                        onPress={removeImage}
                      >
                        <Text className="text-white text-xs px-2">✕</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View className="items-center">
                      <Text className="text-neutral-200 text-base mb-2">
                        📷
                      </Text>
                      <Text className="text-neutral-200 text-sm">
                        {t("modals.transactionModal.tapToAddImage")}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
      <TouchableOpacity
        className={`rounded-xl py-3 mt-5 ${
          isSubmitting ? "bg-gray-600" : "bg-accent-200"
        }`}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <View className="flex-row justify-center items-center">
            <ActivityIndicator size="small" color="white" />
            <Text className="text-white text-center text-lg font-bold ml-2">
              {t("modals.transactionModal.saving")}
            </Text>
          </View>
        ) : (
          <Text className="text-white text-center text-lg font-bold">
            {t("modals.transactionModal.save")}
          </Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default TransactionCreate;
