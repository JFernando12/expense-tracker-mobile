import { useGlobalContext } from '@/lib/global-provider';
import { register, upgradeToPremium } from '@/lib/services/user/user';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SubscriptionPlan {
  id: 'monthly' | 'yearly';
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular: boolean;
}

// Mock subscription plans
const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'monthly',
    title: 'Plan Mensual',
    price: '$4.99',
    period: '/mes',
    description: 'Perfecto para comenzar',
    features: [
      'Sincronización automática en la nube',
      'Respaldo seguro de tus datos',
      'Actualizaciones en tiempo real',
    ],
    popular: false,
  },
  {
    id: 'yearly',
    title: 'Plan Anual',
    price: '$39.99',
    period: '/año',
    description: 'Ahorra 33% - ¡Mejor valor!',
    features: [
      'Sincronización automática en la nube',
      'Respaldo seguro de tus datos',
      'Actualizaciones en tiempo real',
      'Soporte prioritario',
    ],
    popular: true,
  },
];

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  userData?: {
    email: string;
    password: string;
    name: string;
  };
}

const SubscriptionModal = ({
  visible,
  onClose,
  userData,
}: SubscriptionModalProps) => {
  const { userLocal, refetchUserLocal } = useGlobalContext();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>(
    'monthly'
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscription = async (planId: 'monthly' | 'yearly') => {
    setIsLoading(true);
    await upgradeToPremium({ subscriptionType: planId, networkEnabled: true });

    // If userData is provided and the user is not logged in, register the user
    if (userData && !userLocal?.isLoggedIn) {
      await register({
        networkEnabled: true,
        input: {
          email: userData.email,
          password: userData.password,
          name: userData.name,
        },
      });
    }

    // Refetch user data to update the local state
    await refetchUserLocal();
    setIsLoading(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="bg-primary-100 h-full">
        <View className="flex-1">
          {/* Header */}
          <View className="px-5 pt-5 pb-2 border-b border-primary-300">
            <View className="relative flex-row justify-center items-center">
              <TouchableOpacity
                onPress={onClose}
                className="p-2 absolute left-0"
              >
                <Ionicons name="close-outline" size={24} color="#fff" />
              </TouchableOpacity>
              <Text className="text-white text-lg font-bold">
                Suscripción Premium
              </Text>
            </View>
          </View>
          <ScrollView className="flex-1 px-5">
            {/* Hero Section */}
            <View className="items-center mt-5">
              <Text className="text-white text-2xl font-bold text-center mb-3">
                Sincroniza tus Datos en la Nube
              </Text>
              <Text className="text-neutral-200 text-center text-base leading-6">
                Mantén tus gastos seguros y accesibles desde cualquier
                dispositivo
              </Text>
            </View>

            {/* Subscription Plans */}
            <View className="mt-4">
              <Text className="text-white text-xl font-bold text-center">
                Elige tu plan
              </Text>
              <View className="flex-col gap-4 mt-4">
                {subscriptionPlans.map((plan) => (
                  <TouchableOpacity
                    key={plan.id}
                    className={`p-5 rounded-2xl border-2 relative overflow-hidden ${
                      selectedPlan === plan.id
                        ? 'border-accent-200 bg-accent-200/10'
                        : 'border-primary-300 bg-primary-200/50'
                    }`}
                    onPress={() => setSelectedPlan(plan.id)}
                  >
                    {plan.popular && (
                      <View className="absolute top-1 right-1 bg-gradient-to-r from-accent-200 to-orange-400 px-4 py-1 rounded-full">
                        <Text className="text-white text-xs font-bold">
                          ¡Más Popular!
                        </Text>
                      </View>
                    )}

                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <Text className="text-white text-xl font-bold mb-1">
                          {plan.title}
                        </Text>
                        <Text className="text-neutral-300 text-sm">
                          {plan.description}
                        </Text>
                      </View>
                      <View className="items-end ml-4">
                        <Text className="text-2xl font-bold text-white">
                          {plan.price}
                        </Text>
                        <Text className="text-neutral-300 text-sm">
                          {plan.period}
                        </Text>
                      </View>
                    </View>

                    <View className="mt-2">
                      {plan.features.map((feature, idx) => (
                        <View key={idx} className="flex-row items-center">
                          <Text className="text-accent-200 text-sm mr-2">
                            •
                          </Text>
                          <Text className="text-neutral-200 text-sm flex-1">
                            {feature}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {selectedPlan === plan.id && (
                      <View className="absolute top-1 right-1">
                        <View className="w-6 h-6 bg-accent-200 rounded-full items-center justify-center">
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
          <View className="px-5 pb-5 border-t border-primary-300/50 pt-5 bg-primary-100">
            <TouchableOpacity
              className={`py-4 rounded-xl mb-4 ${
                isLoading ? 'bg-neutral-600' : 'bg-accent-200'
              }`}
              onPress={() => handleSubscription(selectedPlan)}
              disabled={isLoading}
              style={{
                shadowColor: isLoading ? '#666' : '#FF6B35',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isLoading ? 0.2 : 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              {isLoading ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator size="small" color="#fff" />
                  <Text className="text-white text-lg font-bold ml-2">
                    Procesando...
                  </Text>
                </View>
              ) : (
                <Text className="text-white text-lg font-bold text-center">
                  Comenzar con{' '}
                  {subscriptionPlans.find((p) => p.id === selectedPlan)?.title}
                </Text>
              )}
            </TouchableOpacity>
            {/* Security Badge */}
            <View className="flex-row items-center justify-center mb-3">
              <Text className="text-green-400 text-sm mr-2">🔒</Text>
              <Text className="text-neutral-300 text-sm font-medium">
                Pago 100% seguro y encriptado
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-neutral-400 text-xs text-center leading-4">
                • Cancela en cualquier momento, sin compromiso a largo plazo
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default SubscriptionModal;
