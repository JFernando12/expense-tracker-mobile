import icons from '@/constants/icons';
import images from '@/constants/images';
import { updateUser } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
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
  const { user, refetch } = useGlobalContext();
  const [name, setName] = useState(user?.name || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateName = async () => {
    try {
      setIsLoading(true);
      const result = await updateUser({ name });
      if (result) {
        Alert.alert('Success', 'Profile updated successfully');
        await refetch();
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

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
          <TouchableOpacity className="absolute bottom-1 right-3">
            <Image
              source={icons.edit as ImagePropsBase}
              className="size-9"
              tintColor="white"
            />
          </TouchableOpacity>
        </View>
      </View>
      <View className="mt-5">
        <Text className="text-white">Name</Text>
        <TextInput
          className="mt-3 bg-gray-800 text-white p-3 rounded-lg mb-4"
          placeholder="Enter your name"
          placeholderTextColor="gray"
          value={name}
          onChangeText={setName}
        />
      </View>

      <TouchableOpacity
        className="mt-5 bg-blue-500 p-3 rounded-lg"
        onPress={handleUpdateName}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-center font-bold">Save Changes</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ProfileModal;
