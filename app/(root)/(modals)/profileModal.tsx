import icons from "@/constants/icons";
import images from "@/constants/images";
import { useGlobalContext } from "@/lib/global-provider";
import { updateUser } from '@/lib/services/user/user';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImagePropsBase,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileModal = () => {
  const { userLocal, refetchUserLocal } = useGlobalContext();
  const [name, setName] = useState(userLocal?.name || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateName = async () => {
    try {
      setIsLoading(true);
      await updateUser({ data: { name }, networkEnabled: true });
      await refetchUserLocal();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'An unexpected error occurred');
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
        <Text className="text-white text-2xl font-bold">Editar Perfil</Text>
      </View>
      <View className="flex-col items-center justify-center">
        <View className="relative">
          <View className="size-28 rounded-full overflow-hidden bg-secondary-100 border border-neutral-500 items-center justify-center">
            {userLocal?.name ? (
              <Text className="text-white text-4xl font-bold">
                {userLocal.name.charAt(0).toUpperCase()}
              </Text>
            ) : (
              <Image
                source={images.avatar as ImagePropsBase}
                className="size-5"
                tintColor="#6b7280"
              />
            )}
          </View>
        </View>
      </View>
      <View className="mt-5 rounded-3xl shadow-lg">
        <Text className="text-neutral-200 text-sm mb-1">Nombre</Text>
        <TextInput
          className="bg-primary-200 text-white p-4 rounded-xl border border-primary-300 mb-4"
          placeholder="Enter your name"
          placeholderTextColor="gray"
          value={name}
          onChangeText={setName}
        />
      </View>

      <TouchableOpacity
        className={`rounded-xl py-3 mt-5 ${
          isLoading ? 'bg-gray-600' : 'bg-accent-200'
        }`}
        onPress={handleUpdateName}
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

export default ProfileModal;
