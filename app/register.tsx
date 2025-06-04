import { useGlobalContext } from '@/lib/global-provider';
import { router } from 'expo-router';
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
import { register } from '../lib/appwrite';

const Register = () => {
  const { refetchUser } = useGlobalContext();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const handleRegister = async () => {
    // Basic validation
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }

    // Email validation using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor ingresa una dirección de correo válida');
      return;
    }

    setIsLoading(true);
    try {
      const success = await register(email, password, name);

      if (success) {
        await refetchUser();
        router.replace('/(root)/(tabs)');
      } else {
        Alert.alert(
          'Error de Registro',
          'No se pudo registrar. Por favor intenta de nuevo.'
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
        <Text className="text-neutral-200 text-lg">Vamos a</Text>
        <Text className="text-white text-2xl font-bold">Comenzar</Text>
      </View>
      <View className="mt-10">
        <Text className="text-neutral-200">
          Crea una cuenta para controlar tus gastos
        </Text>
      </View>
      <View className="mt-5 flex-col gap-5">
        <View className="bg-primary-300 rounded-xl py-4 px-5">
          <TextInput
            className="text-white"
            placeholder="Ingresa tu nombre"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>
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
      <TouchableOpacity
        className="mt-10 bg-accent-200 flex-row justify-center items-center py-4 rounded-3xl"
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text className="text-white text-xl font-bold">Registrarse</Text>
        )}
      </TouchableOpacity>
      <View className="mt-10 flex-row justify-center items-center gap-2">
        <Text className="text-neutral-200">¿Ya tienes una cuenta?</Text>
        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text className="text-accent-200 font-bold">Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Register;
