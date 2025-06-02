import CustomField from "@/components/CustomField";
import icons from "@/constants/icons";
import { createWallet, deleteWallet } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
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

const WalletUpdate = () => {
  const { id } = useLocalSearchParams();
  const { refetchResources, wallets, isLocalMode } = useGlobalContext();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    initialBalance: '',
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

  const handleUpdateWallet = async () => {
    if (!walletToEdit) {
      Alert.alert('Algo salio mal', 'Cartera no encontrada');
      return;
    }

    // Validate form
    if (!formData.name.trim()) {
      Alert.alert(
        'Completo los campos',
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
        isLocalMode,
        data: {
          name: formData.name,
          description: formData.description,
          initialBalance: initialBalance,
        },
      });

      // Refetch resources to update the wallet list
      await refetchResources();
      Alert.alert('Éxito', 'Cartera actualizada exitosamente', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error updating wallet:', error);
      Alert.alert(
        'Algo salio mal',
        'Ocurrió un error al actualizar la cartera'
      );
    } finally {
      setIsLoading(false);
    }
  };
  const handleDelete = async () => {
    if (!walletToEdit) return;

    Alert.alert(
      'Eliminar Cartera',
      '¿Estás seguro de que quieres eliminar esta cartera? Esta acción no se puede deshacer. La cartera no se puede eliminar si tiene transacciones.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteWallet(walletToEdit.id, isLocalMode);

              Alert.alert('Éxito', 'Cartera eliminada exitosamente', [
                {
                  text: 'OK',
                  onPress: () => {
                    refetchResources();
                    router.back();
                  },
                },
              ]);
            } catch (error) {
              console.error('Error deleting wallet:', error);
              Alert.alert(
                'Algo salio mal',
                'Ocurrió un error al eliminar la cartera'
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
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
        <Text className="text-white text-2xl font-bold">Editar Cartera</Text>
      </View>

      {!walletToEdit ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-lg">Cartera no encontrada</Text>
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
                  onChangeText={(text) => handleFieldChange(field.key, text)}
                />
              ))}
            </View>
          </ScrollView>
          <TouchableOpacity
            className={`rounded-xl py-3 mt-5 ${
              isLoading || isDeleting ? 'bg-gray-600' : 'bg-accent-200'
            }`}
            onPress={handleUpdateWallet}
            disabled={isLoading || isDeleting}
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
          {/* Delete button */}
          <TouchableOpacity
            className={`rounded-xl py-3 mt-3 ${
              isDeleting || isLoading ? 'bg-gray-600' : 'bg-red-600'
            }`}
            onPress={handleDelete}
            disabled={isDeleting || isLoading}
          >
            {isDeleting ? (
              <View className="flex-row justify-center items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white text-center text-lg font-bold ml-2">
                  Eliminando...
                </Text>
              </View>
            ) : (
              <Text className="text-white text-center text-lg font-bold">
                Eliminar
              </Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
};

export default WalletUpdate;
