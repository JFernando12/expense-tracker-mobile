import icons from '@/constants/icons';
import images from '@/constants/images';
import { router } from 'expo-router';
import React from 'react';
import { Image, ImagePropsBase, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileModal = () => {
  return (
    <SafeAreaView className="bg-black h-full p-5">
      <View className="relative flex-row items-center justify-center mb-5">
        <TouchableOpacity
          className="absolute left-0 p-2"
          onPress={() => router.push('/(root)/(tabs)/profile')}
        >
          <Image source={icons.backArrow as ImagePropsBase} className='size-9' tintColor='white' />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Editar Perfil</Text>
      </View>
      <View className='flex-col items-center justify-center'>
        <View className='relative'>
          <Image source={images.avatar as ImagePropsBase} className='size-40 rounded-full' />
          <TouchableOpacity className='absolute bottom-1 right-3'>
            <Image source={icons.edit as ImagePropsBase} className='size-9' tintColor='white' />
          </TouchableOpacity>
        </View>
      </View>
      <View className='mt-5'>
        <Text className='text-white'>Name</Text>
        <TextInput
          className="mt-3 bg-gray-800 text-white p-3 rounded-lg mb-4"
          placeholder="Enter your name"
          placeholderTextColor="gray"
          value='Fernando Castrejon'
        />
      </View>
    </SafeAreaView>
  );
};

export default ProfileModal;
