import CustomField from "@/components/CustomField";
import icons from "@/constants/icons";
import { useGlobalContext } from '@/lib/global-provider';
import { router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  ImagePropsBase,
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

const TransactionCreate = () => {
  const {
    expenseCategories,
    incomeCategories,
    wallets,
    expenseCategoriesLoading,
    incomeCategoriesLoading,
    walletsLoading,
  } = useGlobalContext();

  const fields = [
    {
      label: 'wallet',
      title: 'Cartera',
      type: fieldTypes.SELECT,
      value: '',
      options:
        wallets?.map((wallet: { name: string; id: string }) => ({
          label: wallet.name,
          value: wallet.id,
        })) || [],
    },
    {
      label: 'expenseCategory',
      title: 'Categoria',
      type: fieldTypes.SELECT,
      value: '',
      options:
        expenseCategories?.map((category: { name: string; id: string }) => ({
          label: category.name,
          value: category.id,
        })) || [],
    },
    {
      label: 'incomeCategory',
      title: 'Categoria',
      type: fieldTypes.SELECT,
      value: '',
      options:
        incomeCategories?.map((category: { name: string; id: string }) => ({
          label: category.name,
          value: category.id,
        })) || [],
    },
    { label: 'date', title: 'Fecha', type: fieldTypes.DATE, value: '' },
    { label: 'amount', title: 'Monto', type: fieldTypes.NUMBER, value: '' },
    {
      label: 'description',
      title: 'Descripcion',
      type: fieldTypes.TEXT,
      value: '',
    },
  ];
  const isLoading =
    expenseCategoriesLoading || incomeCategoriesLoading || walletsLoading;

  return (
    <SafeAreaView className="bg-black h-full p-5">
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
        <Text className="text-white text-2xl font-bold">Nueva Transaccion</Text>
      </View>
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="white" />
          <Text className="text-white mt-4">Cargando datos...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1">
          <View className="mt-5">
            {fields.map((field, index) => (
              <CustomField
                key={index}
                label={field.label}
                title={field.title}
                value={field.value}
                type={field.type}
                options={field.options}
                onChangeText={(text) => {
                  // Handle text change logic here
                  console.log(`${field.label} changed to: ${text}`);
                }}
              />
            ))}
          </View>
        </ScrollView>
      )}
      <TouchableOpacity className="bg-blue-600 rounded-xl py-3 mt-5">
        <Text className="text-white text-center text-lg font-bold">
          Guardar
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default TransactionCreate;
