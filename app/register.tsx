import { useGlobalContext } from '@/lib/global-provider';
import { router } from 'expo-router';
import React, { useState } from 'react';
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
import { register } from '../lib/appwrite';

const Register = () => {
  const { refetchUser } = useGlobalContext();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState('monthly');

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
                  router.replace('/(root)/(tabs)');
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
                      <Text className="text-white text-base">{feature}</Text>
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
                      className={`relative rounded-xl p-5 border-2 ${
                        selectedPlan === plan.id
                          ? 'border-accent-200 bg-accent-200/10'
                          : 'border-primary-300 bg-primary-300'
                      }`}
                      onPress={() => setSelectedPlan(plan.id)}
                    >
                      {plan.popular && (
                        <View className="absolute -top-2 right-4 bg-accent-200 px-3 py-1 rounded-full">
                          <Text className="text-white text-xs font-bold">
                            MÁS POPULAR
                          </Text>
                        </View>
                      )}

                      <View className="flex-row justify-between items-start mb-3">
                        <View className="flex-1">
                          <Text className="text-white text-xl font-bold">
                            {plan.title}
                          </Text>
                          <Text className="text-neutral-200 text-sm mt-1">
                            {plan.description}
                          </Text>
                        </View>
                        <View className="items-end">
                          <View className="flex-row items-baseline">
                            <Text className="text-white text-2xl font-bold">
                              {plan.price}
                            </Text>
                            <Text className="text-neutral-200 text-sm">
                              {plan.period}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <View key={index} className="flex-row items-center">
                            <Text className="text-accent-200 mr-2">✓</Text>
                            <Text className="text-neutral-200 text-sm flex-1">
                              {feature}
                            </Text>
                          </View>
                        ))}
                      </View>

                      {selectedPlan === plan.id && (
                        <View className="absolute top-4 right-4">
                          <View className="w-6 h-6 rounded-full bg-accent-200 justify-center items-center">
                            <Text className="text-white text-xs font-bold">
                              ✓
                            </Text>
                          </View>
                        </View>
                      )}
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
                    Suscribirse por{' '}
                    {
                      subscriptionPlans.find((p) => p.id === selectedPlan)
                        ?.price
                    }
                  </Text>
                )}
              </TouchableOpacity>

              <View className="items-center">
                <Text className="text-neutral-400 text-xs text-center">
                  • Cancela en cualquier momento{'\n'}• Sin compromisos a largo
                  plazo{'\n'}• Garantía de devolución de 7 días
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default Register;
