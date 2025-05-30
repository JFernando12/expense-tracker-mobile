import CustomField from '@/components/CustomField';
import icons from '@/constants/icons';
import { updateTransaction } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
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
  const { id } = useLocalSearchParams();
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>(
    'expense'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  // Form state
  const [formData, setFormData] = useState({
    walletId: '',
    categoryId: '',
    description: '',
    amount: '',
    date: new Date(),
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const {
    expenseCategories,
    incomeCategories,
    wallets,
    transactions,
    expenseCategoriesLoading,
    incomeCategoriesLoading,
    walletsLoading,
    transactionsLoading,
    refetchResources,
    refetchTransactions,
  } = useGlobalContext();

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
    if (transactionToEdit && wallets && expenseCategories && incomeCategories) {
      setFormData({
        walletId: transactionToEdit.walletId || '',
        categoryId: transactionToEdit.categoryId || '',
        description: transactionToEdit.description,
        amount: transactionToEdit.amount.toString(),
        date: parseDate(transactionToEdit.date),
      });
      setTransactionType(
        transactionToEdit.type === TransactionType.INCOME ? 'income' : 'expense'
      );
      // Set existing image
      setOriginalImageUrl(transactionToEdit.imageUrl || null);
      setSelectedImage(transactionToEdit.imageUrl || null);
    }
  }, [transactionToEdit, wallets, expenseCategories, incomeCategories]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permisos requeridos',
          'Se necesitan permisos para acceder a la galería de fotos.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permisos requeridos',
          'Se necesitan permisos para acceder a la cámara.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const showImagePicker = () => {
    Alert.alert('Seleccionar imagen', 'Elige una opción', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Tomar foto', onPress: takePhoto },
      { text: 'Galería', onPress: pickImage },
    ]);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setRemoveImage(true);
  };

  const validateForm = () => {
    if (!transactionToEdit) {
      Alert.alert('Error', 'Transacción no encontrada');
      return false;
    }
    if (!formData.walletId) {
      Alert.alert('Error', 'Debe seleccionar una cartera');
      return false;
    }
    if (!formData.categoryId) {
      Alert.alert('Error', 'Debe seleccionar una categoría');
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      Alert.alert('Error', 'Debe ingresar un monto válido mayor a 0');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const success = await updateTransaction({
        id: transactionToEdit!.id,
        walletId: formData.walletId,
        categoryId: formData.categoryId,
        description: formData.description,
        amount: parseFloat(formData.amount),
        type: transactionType as TransactionType,
        date: formData.date,
        imageUri: selectedImage || undefined,
        removeImage: removeImage,
      });

      if (success) {
        Alert.alert('Éxito', 'Transacción actualizada exitosamente', [
          {
            text: 'OK',
            onPress: () => {
              refetchResources(); // Refresh wallets and categories
              refetchTransactions(); // Refresh transactions
              router.back();
            },
          },
        ]);
      } else {
        Alert.alert('Error', 'No se pudo actualizar la transacción');
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      Alert.alert('Error', 'Ocurrió un error al actualizar la transacción');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const isIOS = Platform.OS === 'ios';
    setShowDatePicker(isIOS);
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
      title: 'Cartera',
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
      title: 'Categoria',
      type: fieldTypes.SELECT,
      value: formData.categoryId,
      options:
        transactionType === 'expense'
          ? expenseCategories?.map(
              (category: { name: string; id: string }) => ({
                label: category.name,
                value: category.id,
              })
            ) || []
          : incomeCategories?.map((category: { name: string; id: string }) => ({
              label: category.name,
              value: category.id,
            })) || [],
    },
    {
      label: 'date',
      title: 'Fecha',
      type: fieldTypes.DATE,
      value: formData.date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    },
    {
      label: 'amount',
      title: 'Monto',
      type: fieldTypes.NUMBER,
      value: formData.amount,
    },
    {
      label: 'description',
      title: 'Descripcion',
      type: fieldTypes.TEXT,
      value: formData.description,
    },
  ];

  const isLoading =
    expenseCategoriesLoading ||
    incomeCategoriesLoading ||
    walletsLoading ||
    transactionsLoading;
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
          <Text className="text-white text-lg">Transacción no encontrada</Text>
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
          Editar Transaccion
        </Text>
      </View>
      <View className="mb-4">
        <SegmentedControl
          values={['Gasto', 'Ingreso']}
          selectedIndex={transactionType === 'expense' ? 0 : 1}
          backgroundColor="#2A2D3E"
          tintColor={transactionType === 'expense' ? '#EA4335' : '#34A853'}
          onChange={(event) => {
            const selectedValue = event.nativeEvent.value;
            const newType = selectedValue === 'Gasto' ? 'expense' : 'income';
            setTransactionType(newType);
            // Reset category when transaction type changes
            setFormData((prev) => ({
              ...prev,
              categoryId: '',
            }));
          }}
        />
      </View>
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="white" />
          <Text className="text-white mt-4">Cargando datos...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="rounded-3xl mb-6 shadow-lg">
            {fields.map((field, index) => (
              <View key={index}>
                {field.label === 'date' ? (
                  <View className="py-3 px-0">
                    <Text className="text-neutral-200 text-sm mb-1">
                      {field.title}
                    </Text>
                    <TouchableOpacity
                      className="bg-primary-200 rounded-xl border border-primary-300 py-4 px-4"
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text className="text-white text-base">
                        {field.value}
                      </Text>
                    </TouchableOpacity>
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
                Ticket/Comprobante
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
                    <Text className="text-neutral-200 text-base mb-2">📷</Text>
                    <Text className="text-neutral-200 text-sm">
                      Toca para agregar una imagen
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
          {showDatePicker && (
            <DateTimePicker
              value={formData.date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
            />
          )}
        </ScrollView>
      )}
      <TouchableOpacity
        className={`rounded-xl py-3 mt-5 ${
          isSubmitting ? 'bg-gray-600' : 'bg-accent-200'
        }`}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <View className="flex-row justify-center items-center">
            <ActivityIndicator size="small" color="white" />
            <Text className="text-white text-center text-lg font-bold ml-2">
              Guardando...
            </Text>
          </View>
        ) : (
          <Text className="text-white text-center text-lg font-bold">
            Guardar
          </Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default TransactionUpdate;
