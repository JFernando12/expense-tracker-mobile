import icons from "@/constants/icons";
import images from "@/constants/images";
import { updateUser } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImagePropsBase,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ProfileModal = () => {
  const { user, refetchUser } = useGlobalContext();
  const [name, setName] = useState(user?.name || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateName = async () => {
    try {
      setIsLoading(true);
      const result = await updateUser({ name });
      if (result) {
        await refetchUser();
        Alert.alert('Éxito', 'Perfil editado correctamente');
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
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
          <Image
            source={
              user?.avatar
                ? { uri: user.avatar }
                : (images.avatar as ImagePropsBase)
            }
            className="size-40 rounded-full"
          />
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
