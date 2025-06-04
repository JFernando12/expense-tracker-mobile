import { useGlobalContext } from '@/lib/global-provider';
import { Redirect, router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { login } from '../lib/appwrite';

const Login = () => {
  const { refetchUser, userLoading, isLoggedIn } = useGlobalContext();

  if (!userLoading && isLoggedIn) return <Redirect href="/" />;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const handleLogin = async () => {
    // Basic validation
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu correo y contraseña');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor ingresa una dirección de correo válida');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(email, password);

      if (success) {
        await refetchUser();
      } else {
        Alert.alert(
          'Inicio de sesión fallido',
          'Correo o contraseña inválidos. Por favor intenta de nuevo.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error inesperado.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <SafeAreaView className="bg-primary-100 h-full p-5">
      <View className="mt-20">
        <Text className="text-neutral-200 text-lg">Hola,</Text>
        <Text className="text-white text-2xl font-bold">
          ¡Bienvenido de nuevo!
        </Text>
      </View>
      <View className="mt-10">
        <Text className="text-neutral-200">
          Inicia sesión para seguir tus gastos
        </Text>
      </View>
      <View className="mt-5 flex-col gap-5">
        <View className="bg-primary-300 rounded-xl py-4 px-5">
          <TextInput
            className="text-white"
            placeholder="Ingresa tu correo electrónico"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View className="bg-primary-300 rounded-xl py-4 px-5">
          <TextInput
            className="text-white"
            placeholder="Ingresa tu contraseña"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>
      </View>
      <TouchableOpacity className="mt-3 flex-row justify-end">
        <Text className="text-neutral-200">¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="mt-10 bg-accent-200 flex-row justify-center items-center py-4 rounded-3xl"
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text className="text-white text-xl font-bold">Iniciar Sesión</Text>
        )}
      </TouchableOpacity>
      <View className="mt-10 flex-row justify-center items-center gap-2">
        <Text className="text-neutral-200">¿No tienes una cuenta?</Text>
        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text className="text-accent-200 font-bold">Registrarse</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Login;
