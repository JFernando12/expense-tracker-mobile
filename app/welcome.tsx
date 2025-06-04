import icons from '@/constants/icons';
import { useGlobalContext } from '@/lib/global-provider';
import { Redirect, router } from 'expo-router';
import React from 'react';
import {
  Image,
  ImagePropsBase,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Welcome = () => {
  const { userLoading, isLoggedIn } = useGlobalContext();

  if (!userLoading && isLoggedIn) return <Redirect href="/(root)/(tabs)" />;
  if (userLoading) return null; // Let the loading be handled by the root layout

  return (
    <SafeAreaView className="bg-primary-100 h-full">
      <View className="flex-1 justify-center items-center px-5">
        {/* Logo/Icon */}
        <View className="mb-16">
          <Image
            source={icons.wallet as ImagePropsBase}
            className="w-24 h-24"
            resizeMode="contain"
          />
        </View>

        {/* Welcome Text */}
        <View className="mb-16 items-center">
          <Text className="text-white text-4xl font-bold text-center mb-4">
            Bienvenido a{'\n'}Expense Tracker
          </Text>
          <Text className="text-neutral-200 text-lg text-center">
            Controla tus gastos de manera inteligente y alcanza tus metas
            financieras
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="w-full space-y-4">
          <TouchableOpacity
            className="bg-accent-200 py-4 rounded-3xl"
            onPress={() => router.push('/(root)/(modals)/loginModal')}
          >
            <Text className="text-white text-xl font-bold text-center">
              Iniciar Sesión
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="border-2 border-accent-200 py-4 rounded-3xl"
            onPress={() =>
              router.push('/(root)/(modals)/loginModal?mode=register')
            }
          >
            <Text className="text-accent-200 text-xl font-bold text-center">
              Crear Cuenta
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="py-4"
            onPress={() => router.push('/(root)/(tabs)')}
          >
            <Text className="text-neutral-300 text-lg text-center">
              Continuar sin cuenta
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="absolute bottom-10 left-0 right-0">
          <Text className="text-neutral-400 text-sm text-center">
            Al continuar, aceptas nuestros términos de servicio y política de
            privacidad
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Welcome;
