import CustomField from '@/components/CustomField';
import { useTranslatedCategories } from '@/constants/categories';
import icons from '@/constants/icons';
import { useGlobalContext } from '@/lib/global-provider';
import { useTranslation } from '@/lib/i18n/useTranslation';
import {
  deleteTransaction,
  updateTransaction,
} from '@/lib/services/fetchData/transactions';
import {
  saveImageToDocuments,
  verifyImageExists,
} from '@/lib/utils/imageUtils';
import { TransactionType } from '@/types/types';
import DateTimePicker from '@react-native-community/datetimepicker';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

enum fieldTypes {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  SELECT = 'select',
}

const TransactionUpdate = () => {
  const { t } = useTranslation();
  const categories = useTranslatedCategories();
  const incomeCategories = categories
    .filter((category) => category.type === 'income')
    .map((category) => ({
      value: category.id,
      label: category.name,
      icon: category.icon,
    }));

  const expenseCategories = categories
    .filter((category) => category.type === 'expense')
    .map((category) => ({
      value: category.id,
      label: category.name,
      icon: category.icon,
    }));

  const { id } = useLocalSearchParams();
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>(
    'expense'
  );

  const {
    isOnlineMode,
    wallets,
    transactions,
    walletsLoading,
    transactionsLoading,
    refetchResources,
    refetchTransactions,
  } = useGlobalContext();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState({
    walletId: '',
    categoryId: '',
    description: '',
    amount: '',
    date: new Date(),
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  // Find the transaction to edit
  const transactionToEdit = transactions?.find(
    (transaction) => transaction.id === id
  );

  // Helper function to parse date string
  const parseDate = (dateString: string): Date => {
    // Handle DD/M/YYYY or DD/MM/YYYY format
    if (typeof dateString === 'string' && dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
      }
    }
    // Fallback to regular Date parsing
    return new Date(dateString);
  };

  useEffect(() => {
    if (transactionToEdit && wallets) {
      setFormData({
        walletId: transactionToEdit.walletId || '',
        categoryId: transactionToEdit.categoryId || '',
        description: transactionToEdit.description || '',
        amount: transactionToEdit.amount.toString(),
        date: parseDate(transactionToEdit.date),
      });
      setTransactionType(
        transactionToEdit.type === TransactionType.INCOME ? 'income' : 'expense'
      );
      // Set existing image and verify it exists
      if (transactionToEdit.imageUrl) {
        verifyImageExists(transactionToEdit.imageUrl).then((exists) => {
          if (exists) {
            setSelectedImage(transactionToEdit.imageUrl);
          } else {
            console.warn(
              'Transaction image no longer exists:',
              transactionToEdit.imageUrl
            );
            // Image file is missing, but don't show an error to the user
            // They can add a new image if needed
          }
        });
      }
    }
  }, [transactionToEdit, wallets]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const pickImage = async () => {
    try {
      const { granted } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        Alert.alert(
          t('alerts.permissionsRequired'),
          t('alerts.galleryPermissionMessage')
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const localUri = result.assets[0].uri;
        const saveResult = await saveImageToDocuments(localUri, 'transaction');

        if (saveResult.success && saveResult.uri) {
          setSelectedImage(saveResult.uri);
        } else {
          Alert.alert(
            t('alerts.somethingWentWrong'),
            saveResult.error || t('alerts.failedToSaveImage')
          );
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(
        t('alerts.somethingWentWrong'),
        t('alerts.couldNotSelectImage')
      );
    }
  };

  const takePhoto = async () => {
    try {
      const { granted } = await ImagePicker.requestCameraPermissionsAsync();
      if (!granted) {
        Alert.alert(
          t('alerts.permissionsRequired'),
          t('alerts.cameraPermissionMessage')
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const localUri = result.assets[0].uri;
        const saveResult = await saveImageToDocuments(
          localUri,
          'transaction_photo'
        );

        if (saveResult.success && saveResult.uri) {
          setSelectedImage(saveResult.uri);
        } else {
          Alert.alert(
            t('alerts.somethingWentWrong'),
            saveResult.error || t('alerts.failedToSaveImage')
          );
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert(
        t('alerts.somethingWentWrong'),
        t('alerts.couldNotTakePhoto')
      );
    }
  };

  const showImagePicker = () => {
    Alert.alert(t('alerts.selectImage'), t('alerts.chooseOption'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('alerts.takePhoto'), onPress: takePhoto },
      { text: t('alerts.gallery'), onPress: pickImage },
    ]);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setRemoveImage(true);
  };

  const handleDelete = async () => {
    if (!transactionToEdit) return;
    Alert.alert(
      t('alerts.deleteTransaction'),
      t('alerts.deleteTransactionConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteTransaction({
                isOnlineMode,
                transactionId: transactionToEdit.id,
              });
              Alert.alert(
                t('common.success'),
                t('alerts.transactionDeletedSuccess'),
                [
                  {
                    text: t('common.ok'),
                    onPress: () => {
                      refetchResources(); // Refresh wallets and categories
                      refetchTransactions(); // Refresh transactions
                      router.back();
                    },
                  },
                ]
              );
            } catch (error) {
              console.error('Error deleting transaction:', error);
              Alert.alert(
                t('common.error'),
                t('alerts.errorDeletingTransaction')
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const validateForm = () => {
    if (!transactionToEdit) {
      Alert.alert(
        t('validation.completeFields'),
        t('validation.transactionNotFound')
      );
      return false;
    }
    if (!formData.walletId) {
      Alert.alert(t('validation.completeFields'), t('validation.selectWallet'));
      return false;
    }
    if (!formData.categoryId) {
      Alert.alert(
        t('validation.completeFields'),
        t('validation.selectCategory')
      );
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      Alert.alert(t('validation.completeFields'), t('validation.validAmount'));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const id = transactionToEdit?.id;
      if (!id) {
        Alert.alert(
          t('alerts.somethingWentWrong'),
          t('modals.transactionModal.transactionNotFoundForUpdate')
        );
        setIsSubmitting(false);
        return;
      }

      await updateTransaction({
        isOnlineMode,
        input: {
          transactionId: id,
          data: {
            walletId: formData.walletId,
            categoryId: formData.categoryId,
            description: formData.description,
            amount: parseFloat(formData.amount),
            type: transactionType as TransactionType,
            date: formData.date.toISOString(),
            imageUrl: selectedImage,
          },
          removeImage,
        },
      });
      Alert.alert(t('common.success'), t('alerts.transactionUpdatedSuccess'), [
        {
          text: t('common.ok'),
          onPress: () => {
            refetchResources(); // Refresh wallets and categories
            refetchTransactions(); // Refresh transactions
            router.back();
          },
        },
      ]);
    } catch (error) {
      console.error('Error updating transaction:', error);
      Alert.alert(
        t('alerts.somethingWentWrong'),
        t('alerts.errorUpdatingTransaction')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    // For Android, date picker closes automatically after selection
    // For iOS, we need to keep it open until user manually closes it
    const isIOS = Platform.OS === 'ios';
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
      label: 'walletId',
      title: t('modals.transactionModal.walletLabel'),
      type: fieldTypes.SELECT,
      value: formData.walletId,
      options:
        wallets?.map((wallet: { name: string; id: string }) => ({
          label: wallet.name,
          value: wallet.id,
        })) || [],
    },
    {
      label: 'categoryId',
      title: t('modals.transactionModal.categoryLabel'),
      type: fieldTypes.SELECT,
      value: formData.categoryId,
      options:
        transactionType === 'expense' ? expenseCategories : incomeCategories,
    },
    {
      label: 'date',
      title: t('modals.transactionModal.dateLabel'),
      type: fieldTypes.DATE,
      value: formData.date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    },
    {
      label: 'amount',
      title: t('modals.transactionModal.amountLabel'),
      type: fieldTypes.NUMBER,
      value: formData.amount,
    },
    {
      label: 'description',
      title: t('modals.transactionModal.descriptionLabel'),
      type: fieldTypes.TEXT,
      value: formData.description,
    },
  ];

  const isLoading = walletsLoading || transactionsLoading;

  if (!transactionToEdit && !transactionsLoading) {
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
            Editar Transaccion
          </Text>
        </View>
        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-lg">
            {t('modals.transactionModal.transactionNotFound')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
          {t('modals.transactionModal.editTitle')}
        </Text>
      </View>
      <View className="mb-4">
        <SegmentedControl
          values={[
            t('modals.transactionModal.expense'),
            t('modals.transactionModal.income'),
          ]}
          selectedIndex={transactionType === 'expense' ? 0 : 1}
          tintColor={transactionType === 'expense' ? '#EA4335' : '#34A853'}
          onChange={(event) => {
            const selectedValue = event.nativeEvent.value;
            const newType =
              selectedValue === t('modals.transactionModal.expense')
                ? 'expense'
                : 'income';
            setTransactionType(newType);
            // Reset category when transaction type changes
            setFormData((prev) => ({
              ...prev,
              categoryId: '',
            }));
          }}
        />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {isLoading && !isSubmitting ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="white" />
            <Text className="text-white mt-4">
              {t('modals.transactionModal.loadingData')}
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
                  {field.label === 'date' ? (
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
                      {showDatePicker && field.label === 'date' && (
                        <DateTimePicker
                          value={formData.date}
                          mode="date"
                          display={
                            Platform.OS === 'ios' ? 'spinner' : 'default'
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
                  {t('modals.transactionModal.ticketLabel')}
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
                          width: '100%',
                          height: undefined,
                          aspectRatio: 1,
                        }}
                        className="rounded-lg"
                        resizeMode="contain"
                        onError={(error) => {
                          console.error(
                            'Image load error:',
                            error.nativeEvent.error
                          );
                          console.log('Failed image URI:', selectedImage);
                          // Optionally remove the broken image
                          setSelectedImage(null);
                        }}
                      />
                      <TouchableOpacity
                        className="absolute top-2 right-2 bg-red-600 rounded-full p-1"
                        onPress={handleRemoveImage}
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
                        {t('modals.transactionModal.tapToAddImage')}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      {/* Action buttons */}
      <View className="flex-row gap-3 mt-5">
        <TouchableOpacity
          className={`flex-1 rounded-xl py-3 ${
            isSubmitting || isDeleting ? 'bg-gray-600' : 'bg-accent-200'
          }`}
          onPress={handleSubmit}
          disabled={isSubmitting || isDeleting}
        >
          {isSubmitting ? (
            <View className="flex-row justify-center items-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white text-center text-lg font-bold ml-2">
                {t('modals.transactionModal.saving')}
              </Text>
            </View>
          ) : (
            <Text className="text-white text-center text-lg font-bold">
              {t('modals.transactionModal.save')}
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          className={`rounded-xl flex justify-center items-center px-3 ${
            isDeleting || isSubmitting ? 'bg-gray-600' : 'bg-red-600'
          }`}
          onPress={handleDelete}
          disabled={isDeleting || isSubmitting}
        >
          {isDeleting ? (
            <View className="flex-row justify-center items-center">
              <ActivityIndicator size="small" color="white" />
            </View>
          ) : (
            <Image
              source={icons.trashCan as ImagePropsBase}
              className="size-8"
              tintColor="white"
            />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default TransactionUpdate;
