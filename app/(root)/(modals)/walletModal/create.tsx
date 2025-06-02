import CustomField from '@/components/CustomField';
import icons from '@/constants/icons';
import { createWallet } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

const WalletCreate = () => {
  const { refetchResources, isOnlineMode } = useGlobalContext();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    initialBalance: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const fields = [
    {
      label: 'Nombre',
      title: 'Nombre',
      value: formData.name,
      type: fieldTypes.TEXT,
      key: 'name',
    },
    {
      label: 'Descripción',
      title: 'Descripción',
      value: formData.description,
      type: fieldTypes.TEXT,
      key: 'description',
    },
    {
      label: 'Saldo inicial',
      title: 'Saldo inicial',
      value: formData.initialBalance,
      type: fieldTypes.NUMBER,
      key: 'initialBalance',
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
        'Completa los campos',
        'El nombre de la cartera es requerido'
      );
      return;
    }

    if (!formData.initialBalance.trim()) {
      Alert.alert('Completa los campos', 'El saldo inicial es requerido');
      return;
    }

    const initialBalance = parseFloat(formData.initialBalance);
    if (isNaN(initialBalance) || initialBalance < 0) {
      Alert.alert(
        'Completa los campos',
        'El saldo inicial debe ser mayor o igual a 0'
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
      Alert.alert('Éxito', 'Cartera creada exitosamente', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error creating wallet:', error);
      Alert.alert(
        'Error',
        'Ocurrió un error al crear la cartera. Inténtalo de nuevo.'
      );
    } finally {
      setIsLoading(false);
    }
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
        <Text className="text-white text-2xl font-bold">Nueva Cartera</Text>
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
              onChangeText={(text) => {
                handleFieldChange(field.key, text);
              }}
            />
          ))}
        </View>
      </ScrollView>
      <TouchableOpacity
        className={`rounded-xl py-3 mt-5 ${
          isLoading ? 'bg-gray-600' : 'bg-accent-200'
        }`}
        onPress={handleCreateWallet}
        disabled={isLoading}
      >
        {isLoading ? (
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

export default WalletCreate;
