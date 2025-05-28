import icons from '@/constants/icons';
import images from '@/constants/images';
import { router } from 'expo-router';
import React from 'react';
import {
  Image,
  ImagePropsBase,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SectionButton = ({
  children,
  onPress,
  icon,
  className = 'bg-gray-800 p-3 rounded-lg mb-2',
}: {
  children: React.ReactNode;
  onPress: () => void;
  icon?: any;
  className?: string;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center justify-between ${className}`}
    >
      <View className="flex-row items-center">
        <Image source={icon} tintColor="white" className="size-9" />
        <Text className="flex-1 ml-4 text-white text-lg">{children}</Text>
        <Image
          source={icons.rightArrow as ImagePropsBase}
          tintColor="white"
          className="size-6 ml-2"
        />
      </View>
    </TouchableOpacity>
  );
};

const sections = [
  {
    title: 'Edit Profile',
    onPress: () => router.push('/(root)/(modals)/profileModal'),
    icon: icons.person,
  },
  {
    title: 'Settings',
    onPress: () => console.log('Settings Pressed'),
    icon: icons.filter,
  },
  {
    title: 'Privacy Policy',
    onPress: () => console.log('Privacy Policy Pressed'),
    icon: icons.info,
  },
  {
    title: 'Logout',
    onPress: () => console.log('Logout Pressed'),
    icon: icons.logout,
  },
];

const Profile = () => {
  return (
    <SafeAreaView className="p-5 bg-black h-full">
      <View className="flex-row items-center justify-center mb-5">
        <Text className="text-2xl font-bold text-white">Profile</Text>
      </View>
      <View className="flex-col items-center justify-center mb-10">
        <View className="w-32 h-32 rounded-full bg-white flex items-center justify-center">
          <Image
            source={images.avatar as ImagePropsBase}
            resizeMode="contain"
            className="w-28 h-28 rounded-full"
          />
        </View>
        <View className="mt-5 flex-col items-center justify-center">
          <Text className="text-white text-2xl font-bold">
            Fernando Castrejon
          </Text>
          <Text className="text-gray-400">fernandocastrejonh@gmail.com</Text>
        </View>
      </View>
      <View>
        {sections.map((section, index) => (
          <SectionButton
            key={index}
            onPress={section.onPress}
            icon={section.icon}
            className="bg-gray-800 p-3 rounded-lg mb-2"
          >
            {section.title}
          </SectionButton>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default Profile;
