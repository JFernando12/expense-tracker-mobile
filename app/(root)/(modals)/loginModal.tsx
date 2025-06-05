import SuscriptionModal from '@/components/SuscriptionModal';
import { login } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
import Ionicons from '@expo/vector-icons/Ionicons';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LoginModal = () => {
  const { refetchUser, userLoading, isLoggedIn } = useGlobalContext();
  const { mode } = useLocalSearchParams();

  if (!userLoading && isLoggedIn) return <Redirect href="/" />;

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Set initial mode based on URL parameter
  useEffect(() => {
    if (mode === 'register') {
      setIsLoginMode(false);
    } else {
      setIsLoginMode(true);
    }
  }, [mode]);

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
        router.back();
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

    if (!acceptedTerms) {
      Alert.alert('Error', 'Debes aceptar los términos de uso para continuar');
      return;
    }

    // Show subscription modal instead of registering directly
    setShowSubscriptionModal(true);
  };

  return (
    <SafeAreaView className="bg-primary-100 h-full p-5">
      {/* Header with close button */}
      <View className="flex-row justify-between items-center mt-5">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Text className="text-neutral-200 text-lg">✕</Text>
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">
          Sincronización en la nube
        </Text>
        <TouchableOpacity className="p-2">
          <Text className="text-accent-200 text-lg">?</Text>
        </TouchableOpacity>
      </View>
      {/* Cloud sync icon */}
      <View className="items-center mt-3">
        <View className="size-14 bg-neutral-600 rounded-full items-center justify-center mb-4">
          <Ionicons name="cloud-done-outline" size={30} color="#fff" />
        </View>
        <Text className="text-neutral-200 text-center text-xs px-8">
          Guardá tus gastos en la nube, accedé desde cualquier dispositivo y
          nunca pierdas tu información.
        </Text>
      </View>
      {/* Segmented Control */}
      <View className="mt-4">
        <SegmentedControl
          values={['Create new Profile', 'Sign-In']}
          selectedIndex={isLoginMode ? 1 : 0}
          tintColor="#6B7280"
          fontStyle={{ color: '#fff' }}
          activeFontStyle={{ color: '#fff' }}
          onChange={(event) => {
            const selectedValue = event.nativeEvent.value;
            const newMode = selectedValue === 'Sign-In';
            setIsLoginMode(newMode);
            // Clear form when switching modes
            setName('');
            setEmail('');
            setPassword('');
            setAcceptedTerms(false);
          }}
        />
      </View>
      {/* Form inputs */}
      <View className="flex-col gap-4 mt-4">
        {!isLoginMode && (
          <View>
            <Text className="text-neutral-300 mb-2">Name</Text>
            <View className="bg-primary-300 rounded-xl py-4 px-5">
              <TextInput
                className="text-white"
                placeholder="Enter your name"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          </View>
        )}

        <View>
          <Text className="text-neutral-300 mb-2">Email</Text>
          <View className="bg-primary-300 rounded-xl py-4 px-5">
            <TextInput
              className="text-white"
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View>
          <Text className="text-neutral-300 mb-2">Password</Text>
          <View className="bg-primary-300 rounded-xl py-4 px-5">
            <TextInput
              className="text-white"
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>
          {!isLoginMode && (
            <Text className="text-neutral-400 text-xs mt-2 px-1">
              Password must be at least 8 characters long, contain at least one
              number, one uppercase, and one lowercase letter
            </Text>
          )}
        </View>
      </View>
      {/* Terms acceptance for registration */}
      {!isLoginMode && (
        <TouchableOpacity
          className="flex-row items-start mt-6 px-1"
          onPress={() => setAcceptedTerms(!acceptedTerms)}
        >
          <View
            className={`w-5 h-5 border-2 rounded mr-3 mt-1 items-center justify-center ${
              acceptedTerms
                ? 'border-accent-200 bg-accent-200'
                : 'border-neutral-400'
            }`}
          >
            {acceptedTerms && (
              <Text className="text-white text-xs font-bold">✓</Text>
            )}
          </View>
          <Text className="text-neutral-400 text-sm flex-1">
            I accept the
            <Text className="text-accent-200 underline">terms of use</Text> of
            the Tracki synchronization service
          </Text>
        </TouchableOpacity>
      )}
      {/* Action button */}
      <TouchableOpacity
        className="mt-8 bg-accent-200 flex-row justify-center items-center py-4 rounded-xl"
        onPress={isLoginMode ? handleLogin : handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <View className="flex-row items-center">
            <Text className="text-white text-lg font-bold mr-2">
              {isLoginMode ? 'Sign In' : 'Sign Up'}
            </Text>
            <Text className="text-white text-lg">🔒</Text>
          </View>
        )}
      </TouchableOpacity>
      {/* Subscription Modal */}
      <SuscriptionModal
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        email={email}
        password={password}
        name={name}
      />
    </SafeAreaView>
  );
};

export default LoginModal;
