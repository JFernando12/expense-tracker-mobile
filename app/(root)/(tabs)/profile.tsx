import icons from '@/constants/icons';
import { logout } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
import { router } from 'expo-router';
import React from 'react';
import {
  Alert,
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

const Profile = () => {
  const { user, refetchUser } = useGlobalContext();

  const handleLogout = async () => {
    const result = await logout();
    if (!result) {
      Alert.alert('Failed', 'Logout failed');
      return;
    }
    await refetchUser();
    Alert.alert('Success', 'Logout successful');
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
      onPress: handleLogout,
      icon: icons.logout,
    },
  ];

  return (
    <SafeAreaView className="p-5 bg-black h-full">
      <View className="flex-row items-center justify-center mb-5">
        <Text className="text-2xl font-bold text-white">Profile</Text>
      </View>
      <View className="flex-col items-center justify-center mb-10">
        <Image
          source={{ uri: user?.avatar }}
          resizeMode="contain"
          className="size-36 rounded-full"
        />
        <View className="mt-5 flex-col items-center justify-center">
          <Text className="text-white text-2xl font-bold">
            {user?.name || 'User Name'}
          </Text>
          <Text className="text-gray-400">{user?.email}</Text>
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
