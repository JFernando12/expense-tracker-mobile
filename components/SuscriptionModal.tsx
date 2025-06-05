import { useGlobalContext } from '@/lib/global-provider';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { register } from '../lib/appwrite';

// Mock subscription plans
const subscriptionPlans = [
  {
    id: 'monthly',
    title: 'Plan Mensual',
    price: '$4.99',
    period: '/mes',
    description: 'Perfecto para comenzar',
    features: [],
    popular: false,
    isTrial: false,
  },
  {
    id: 'yearly',
    title: 'Plan Anual',
    price: '$39.99',
    period: '/año',
    description: 'Ahorra 33% - ¡Mejor valor!',
    features: [],
    popular: false,
    isTrial: false,
  },
];

interface SuscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  email: string;
  password: string;
  name: string;
}

const SuscriptionModal = ({
  visible,
  onClose,
  email,
  password,
  name,
}: SuscriptionModalProps) => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [isLoading, setIsLoading] = useState(false);

  const { refetchUser } = useGlobalContext();
  const handleSubscription = async (planId: string) => {
    setIsLoading(true);

    // Simulate subscription process
    setTimeout(async () => {
      try {
        const selectedPlanInfo = subscriptionPlans.find((p) => p.id === planId);
        const planName = selectedPlanInfo?.title || 'Plan seleccionado';

        Alert.alert(
          selectedPlanInfo?.isTrial
            ? 'Prueba Gratuita Activada'
            : 'Suscripción Confirmada',
          selectedPlanInfo?.isTrial
            ? `¡Perfecto! Has activado tu prueba gratuita de 7 días. Disfruta de todas las funciones premium sin costo.`
            : `Has seleccionado el ${planName}. En una app real, esto procesaría el pago.`,
          [
            {
              text: 'Continuar',
              onPress: async () => {
                // Proceed with registration after "successful" subscription
                const success = await register(email, password, name);

                if (success) {
                  await refetchUser();
                  onClose();
                  router.back();
                } else {
                  Alert.alert(
                    'Error de Registro',
                    'No se pudo registrar. Por favor intenta de nuevo.'
                  );
                }
              },
            },
            {
              text: 'Cancelar',
              style: 'cancel',
              onPress: () => setIsLoading(false),
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
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="bg-primary-100 h-full">
        <View className="flex-1">
          {/* Header */}
          <View className="px-5 pt-5 pb-2 border-b border-primary-300">
            <View className="flex-row justify-between items-center">
              <TouchableOpacity onPress={onClose} className="p-2">
                <Text className="text-neutral-200 text-lg">✕</Text>
              </TouchableOpacity>
              <Text className="text-white text-lg font-bold">Suscripción</Text>
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

            {/* Subscription Plans */}
            <View className="mb-8">
              <Text className="text-white text-xl font-bold mb-4 text-center">
                Elige tu plan
              </Text>
              <View className="flex-col gap-4">
                {subscriptionPlans.map((plan) => (
                  <TouchableOpacity
                    key={plan.id}
                    className={`p-4 rounded-xl border-2 relative ${
                      selectedPlan === plan.id
                        ? 'border-accent-200 bg-accent-200/10'
                        : 'border-primary-300 bg-primary-200'
                    }`}
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
                      <View className="flex-1">
                        <Text className="text-white text-lg font-bold">
                          {plan.title}
                        </Text>
                        <Text className="text-neutral-300 text-sm">
                          {plan.description}
                        </Text>
                      </View>
                      <View className="items-end ml-4">
                        <Text
                          className={`text-2xl font-bold ${
                            plan.isTrial ? 'text-green-400' : 'text-white'
                          }`}
                        >
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
                  Suscribirse a
                  {` ${subscriptionPlans.find((p) => p.id === selectedPlan)?.title}`}
                </Text>
              )}
            </TouchableOpacity>

            <View className="items-center">
              <Text className="text-neutral-400 text-xs text-center">
                • Cancela en cualquier momento • Sin compromisos a largo plazo •
                Garantía de devolución de 7 días
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default SuscriptionModal;
