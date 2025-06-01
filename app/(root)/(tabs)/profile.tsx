import SectionButton from '@/components/SectionButton';
import icons from '@/constants/icons';
import { logout } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Profile = () => {
  const { user, refetchUser } = useGlobalContext();
  const handleLogout = async () => {
    const result = await logout();
    if (!result) {
      Alert.alert('Fallido', 'Cierre de sesión fallido');
      return;
    }
    await refetchUser();
    Alert.alert('Éxito', 'Cierre de sesión exitoso');
  };
  const sections = [
    {
      title: 'Editar Perfil',
      onPress: () => router.push('/(root)/(modals)/profileModal'),
      icon: icons.person,
      iconBgColor: 'bg-accent-200',
    },
    {
      title: 'Política de privacidad',
      onPress: () => console.log('Privacy Policy Pressed'),
      icon: icons.shield,
      iconBgColor: 'bg-accent-200',
    },
    {
      title: 'Cerrar sesión',
      onPress: handleLogout,
      icon: icons.logout,
      iconBgColor: 'bg-red-500',
    },
  ];

  return (
    <SafeAreaView className="bg-primary-100 h-full -pb-safe-offset-14">
      {/* Profile Section */}
      <View className="items-center pt-10 pb-6">
        <View className="size-36 rounded-full overflow-hidden mb-6">
          <Image source={{ uri: user?.avatar }} className="h-full w-full" />
        </View>
        <Text className="text-white text-3xl font-bold mb-1">
          {user?.name}
        </Text>
        <Text className="text-neutral-300 text-lg">
          {user?.email}
        </Text>
        {/* Edit Profile Button */}
        <TouchableOpacity
          onPress={() => router.push('/(root)/(modals)/profileModal')}
          className="bg-accent-200 rounded-xl py-4 px-16 mt-8"
        >
          <Text className="text-primary-100 font-bold text-xl">
            Editar Perfil
          </Text>
        </TouchableOpacity>
      </View>

      {/* Section Buttons */}
      <View className="rounded-t-3xl flex-1 -mb-5 px-5">
        {sections.slice(1).map((section, index) => (
          <SectionButton
            key={index}
            onPress={section.onPress}
            icon={section.icon}
            className="bg-secondary-100 p-5 rounded-xl mb-3"
            iconBgColor={section.iconBgColor}
          >
            {section.title}
          </SectionButton>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default Profile;
