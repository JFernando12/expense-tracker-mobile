import SectionButton from '@/components/SectionButton';
import icons from '@/constants/icons';
import { logout } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Profile = () => {
  const { user, refetchUser, isLoggedIn, isOnlineMode } = useGlobalContext();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleLogout = async () => {
    const result = await logout();
    if (!result) {
      Alert.alert('Fallido', 'Cierre de sesión fallido');
      return;
    }
    await refetchUser();
    Alert.alert('Éxito', 'Cierre de sesión exitoso');
  };

  const handleLoginToSync = () => {
    router.push('/login');
  };
  const handleSync = async () => {
    // Show confirmation dialog
    Alert.alert(
      'Sincronizar Datos',
      'Esto subirá tus datos locales a la nube. Los datos locales se mantendrán disponibles. ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sincronizar',
          onPress: async () => {
            console.log('Syncing data...');
          },
        },
      ]
    );
  };

  const sections = [
    // Show different sections based on login status
    ...(isLoggedIn
      ? [
          {
            title: 'Editar Perfil',
            onPress: () => router.push('/(root)/(modals)/profileModal'),
            icon: icons.person,
            iconBgColor: 'bg-accent-200',
          },
          {
            title: isSyncing ? 'Sincronizando...' : 'Sincronizar Datos',
            onPress: isSyncing ? () => {} : handleSync,
            icon: icons.wifi,
            iconBgColor: isSyncing ? 'bg-gray-500' : 'bg-blue-500',
            showLoading: isSyncing,
          },
        ]
      : [
          {
            title: 'Sincronizar datos',
            onPress: handleLoginToSync,
            icon: icons.wifi,
            iconBgColor: 'bg-green-500',
          },
        ]),
    {
      title: 'Política de privacidad',
      onPress: () => console.log('Privacy Policy Pressed'),
      icon: icons.shield,
      iconBgColor: 'bg-accent-200',
    },
    ...(isLoggedIn
      ? [
          {
            title: 'Cerrar sesión',
            onPress: handleLogout,
            icon: icons.logout,
            iconBgColor: 'bg-red-500',
          },
        ]
      : []),
  ];

  return (
    <SafeAreaView className="bg-primary-100 h-full -pb-safe-offset-14">
      {/* Profile Section */}
      <View className="items-center pt-10 pb-6">
        <View className="size-36 rounded-full overflow-hidden mb-6 bg-secondary-100 items-center justify-center">
          {isLoggedIn && user?.avatar ? (
            <Image source={{ uri: user.avatar }} className="h-full w-full" />
          ) : (
            <Text className="text-4xl">👤</Text>
          )}
        </View>
        <Text className="text-white text-3xl font-bold mb-1">
          {isLoggedIn ? user?.name : 'Usuario Local'}
        </Text>
        <Text className="text-neutral-300 text-lg">
          {isLoggedIn && user?.email}
        </Text>
        {/* Edit Profile Button or Login Button */}
        <TouchableOpacity
          onPress={
            isLoggedIn
              ? () => router.push('/(root)/(modals)/profileModal')
              : handleLoginToSync
          }
          className="bg-accent-200 rounded-xl py-4 px-16 mt-8"
        >
          <Text className="text-primary-100 font-bold text-xl">
            {isLoggedIn ? 'Editar Perfil' : 'Iniciar Sesión'}
          </Text>
        </TouchableOpacity>
      </View>
      {/* Section Buttons */}
      <View className="rounded-t-3xl flex-1 -mb-5 px-5">
        {sections.slice(isLoggedIn ? 1 : 0).map((section, index) => (
          <SectionButton
            key={index}
            onPress={section.onPress}
            icon={section.icon}
            className="bg-secondary-100 p-5 rounded-xl mb-3"
            iconBgColor={section.iconBgColor}
            showLoading={section.showLoading || false}
          >
            {section.title}
          </SectionButton>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default Profile;
