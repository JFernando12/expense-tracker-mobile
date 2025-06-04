import { login, register } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
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
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Set initial mode based on URL parameter
  useEffect(() => {
    if (mode === 'register') {
      setIsLoginMode(false);
    } else {
      setIsLoginMode(true);
    }
  }, [mode]);

  // Mock subscription plans
  const subscriptionPlans = [
    {
      id: 'monthly',
      title: 'Plan Mensual',
      price: '$4.99',
      period: '/mes',
      description: 'Perfecto para comenzar',
      features: [
        'Gastos ilimitados',
        'Múltiples carteras',
        'Estadísticas básicas',
      ],
      popular: false,
    },
    {
      id: 'yearly',
      title: 'Plan Anual',
      price: '$39.99',
      period: '/año',
      description: 'Ahorra 33% - ¡Más popular!',
      features: [
        'Todo del plan mensual',
        'Estadísticas avanzadas',
        'Exportar reportes',
        'Soporte prioritario',
      ],
      popular: true,
    },
  ];
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

  const handleSubscription = async (planId: string) => {
    setIsLoading(true);

    // Simulate subscription process
    setTimeout(async () => {
      try {
        Alert.alert(
          'Suscripción Simulada',
          `Has seleccionado el ${
            planId === 'monthly' ? 'Plan Mensual' : 'Plan Anual'
          }. En una app real, esto procesaría el pago.`,
          [
            {
              text: 'Continuar',
              onPress: async () => {
                // Proceed with registration after "successful" subscription
                const success = await register(email, password, name);

                if (success) {
                  await refetchUser();
                  setShowSubscriptionModal(false);
                  router.back();
                } else {
                  Alert.alert(
                    'Error de Registro',
                    'No se pudo registrar. Por favor intenta de nuevo.'
                  );
                }
              },
            },
          ]
        );
      } catch (error) {
        Alert.alert('Error', 'Ocurrió un error inesperado.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };
  return (
    <SafeAreaView className="bg-primary-100 h-full p-5">
      {/* Header with close button */}
      <View className="flex-row justify-between items-center mt-5">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Text className="text-neutral-200 text-lg">✕</Text>
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Synchronization</Text>
        <TouchableOpacity className="p-2">
          <Text className="text-accent-200 text-lg">?</Text>
        </TouchableOpacity>
      </View>
      {/* Cloud sync icon */}
      <View className="items-center mt-10 mb-8">
        <View className="w-20 h-20 bg-neutral-600 rounded-full items-center justify-center mb-4">
          <Text className="text-white text-2xl">☁️</Text>
        </View>
        <Text className="text-neutral-200 text-center text-sm px-8">
          Synchronization allows you to access data from different devices and
          do shared accounting
        </Text>
      </View>
      {/* Toggle buttons */}
      <View className="bg-neutral-700 p-1 rounded-xl flex-row mb-8">
        <TouchableOpacity
          className={`flex-1 py-3 rounded-lg ${
            !isLoginMode ? 'bg-neutral-600' : 'bg-transparent'
          }`}
          onPress={() => {
            setIsLoginMode(false);
            setName('');
            setEmail('');
            setPassword('');
            setAcceptedTerms(false);
          }}
        >
          <Text
            className={`text-center font-medium ${
              !isLoginMode ? 'text-white' : 'text-neutral-400'
            }`}
          >
            Create new Profile
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 rounded-lg ${
            isLoginMode ? 'bg-neutral-600' : 'bg-transparent'
          }`}
          onPress={() => {
            setIsLoginMode(true);
            setName('');
            setEmail('');
            setPassword('');
            setAcceptedTerms(false);
          }}
        >
          <Text
            className={`text-center font-medium ${
              isLoginMode ? 'text-white' : 'text-neutral-400'
            }`}
          >
            Sign-In
          </Text>
        </TouchableOpacity>
      </View>
      {/* Form inputs */}
      <View className="flex-col gap-4">
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
            I accept the{' '}
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
      {/* Footer text */}
      {!isLoginMode && (
        <View className="mt-6">
          <Text className="text-neutral-400 text-xs text-center">
            Synchronization of images is not supported.
          </Text>
          <Text className="text-neutral-400 text-xs text-center">
            Recurring transactions only work on the device on which they were
            created.
          </Text>
        </View>
      )}
      {/* Subscription Modal */}
      <Modal
        visible={showSubscriptionModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="bg-primary-100 h-full">
          <View className="flex-1">
            {/* Header */}
            <View className="px-5 pt-5 pb-2 border-b border-primary-300">
              <View className="flex-row justify-between items-center">
                <TouchableOpacity
                  onPress={() => setShowSubscriptionModal(false)}
                  className="p-2"
                >
                  <Text className="text-neutral-200 text-lg">✕</Text>
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold">
                  Suscripción
                </Text>
                <View className="w-8" />
              </View>
            </View>

            <ScrollView className="flex-1 px-5">
              {/* Title Section */}
              <View className="mt-8 mb-6">
                <Text className="text-white text-3xl font-bold text-center">
                  Desbloquea tu{'\n'}Potencial Financiero
                </Text>
                <Text className="text-neutral-200 text-center mt-4 text-lg">
                  Controla tus gastos como nunca antes con funciones premium
                </Text>
              </View>

              {/* Features Section */}
              <View className="mb-8">
                <Text className="text-white text-xl font-bold mb-4">
                  ✨ Lo que obtienes:
                </Text>
                <View className="space-y-3">
                  {[
                    '📊 Estadísticas avanzadas y gráficos detallados',
                    '💰 Múltiples carteras y categorías personalizadas',
                    '📈 Seguimiento de tendencias y presupuestos',
                    '📱 Sincronización en todos tus dispositivos',
                    '📋 Exportación de reportes en PDF',
                    '🔔 Recordatorios inteligentes de gastos',
                  ].map((feature, index) => (
                    <View key={index} className="flex-row items-center">
                      <Text className="text-neutral-200 text-base">
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Subscription Plans */}
              <View className="mb-8">
                <Text className="text-white text-xl font-bold mb-4 text-center">
                  Elige tu plan
                </Text>
                <View className="space-y-4">
                  {subscriptionPlans.map((plan) => (
                    <TouchableOpacity
                      key={plan.id}
                      className={`p-4 rounded-xl border-2 ${
                        selectedPlan === plan.id
                          ? 'border-accent-200 bg-accent-200/10'
                          : 'border-primary-300 bg-primary-200'
                      } ${plan.popular ? 'border-accent-200' : ''}`}
                      onPress={() => setSelectedPlan(plan.id)}
                    >
                      {plan.popular && (
                        <View className="absolute -top-2 right-4 bg-accent-200 px-3 py-1 rounded-full">
                          <Text className="text-white text-xs font-bold">
                            ¡Popular!
                          </Text>
                        </View>
                      )}
                      <View className="flex-row justify-between items-start mb-2">
                        <View>
                          <Text className="text-white text-lg font-bold">
                            {plan.title}
                          </Text>
                          <Text className="text-neutral-300 text-sm">
                            {plan.description}
                          </Text>
                        </View>
                        <View className="items-end">
                          <Text className="text-white text-2xl font-bold">
                            {plan.price}
                          </Text>
                          <Text className="text-neutral-300 text-sm">
                            {plan.period}
                          </Text>
                        </View>
                      </View>
                      <View className="mt-3">
                        {plan.features.map((feature, idx) => (
                          <Text
                            key={idx}
                            className="text-neutral-200 text-sm mb-1"
                          >
                            • {feature}
                          </Text>
                        ))}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View className="px-5 pb-5 border-t border-primary-300 pt-5">
              <TouchableOpacity
                className="bg-accent-200 py-4 rounded-xl mb-3"
                onPress={() => handleSubscription(selectedPlan)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white text-lg font-bold text-center">
                    Suscribirse a{' '}
                    {
                      subscriptionPlans.find((p) => p.id === selectedPlan)
                        ?.title
                    }
                  </Text>
                )}
              </TouchableOpacity>

              <View className="items-center">
                <Text className="text-neutral-400 text-xs text-center">
                  • Cancela en cualquier momento • Sin compromisos a largo plazo
                  • Garantía de devolución de 7 días
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default LoginModal;
