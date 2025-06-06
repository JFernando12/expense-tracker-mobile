import { useGlobalContext } from '@/lib/global-provider';
import { resetToFreeMode } from '@/lib/services/suscription/subscription';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

const SubscriptionStatus = () => {
  const { userSubscription, openSubscriptionModal, isLoggedIn } =
    useGlobalContext();
  const { mode: appMode, planType } = userSubscription || {};

  const handleUpgrade = () => {
    if (!isLoggedIn) {
      router.push('/(root)/(modals)/loginModal');
      return;
    }
    openSubscriptionModal();
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancelar Suscripción',
      '¿Estás seguro de que quieres cancelar tu suscripción? Perderás acceso a las funciones premium.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: async () => {
            await resetToFreeMode();
            Alert.alert(
              'Suscripción Cancelada',
              'Tu suscripción ha sido cancelada.'
            );
          },
        },
      ]
    );
  };

  const getStatusColor = () => {
    if (appMode === 'free') return 'text-neutral-400';
    return 'text-green-400';
  };

  const getStatusText = () => {
    if (appMode === 'free') return 'Modo Gratuito';

    if (planType === 'monthly') return 'Plan Mensual';
    if (planType === 'yearly') return 'Plan Anual';
    return 'Premium';
  };

  const getStatusDescription = () => {
    if (appMode === 'free') {
      return 'Actualiza para sincronización en la nube y más.';
    }
    return 'Tienes acceso completo a todas las funciones premium.';
  };

  return (
    <View className="bg-secondary-100 rounded-2xl p-4">
      {/* Status Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View
            className={`size-3 rounded-full mr-3 ${
              appMode === 'premium' ? 'bg-green-400' : 'bg-neutral-400'
            }`}
          />
          <Text className={`text-lg font-bold ${getStatusColor()}`}>
            {getStatusText()}
          </Text>
        </View>
        {appMode === 'premium' && (
          <View className="bg-accent-200/20 px-2 py-1 rounded-full">
            <Text className="text-accent-200 text-xs font-bold">PREMIUM</Text>
          </View>
        )}
      </View>

      {/* Status Description */}
      <Text className="text-neutral-300 text-sm mb-4">
        {getStatusDescription()}
      </Text>

      {/* Action Buttons */}
      <View className="space-y-2">
        {appMode === 'free' && (
          <TouchableOpacity
            onPress={handleUpgrade}
            className="bg-accent-200 py-3 px-4 rounded-xl"
          >
            <Text className="text-white text-center font-bold">
              Actualizar a Premium
            </Text>
          </TouchableOpacity>
        )}

        {appMode === 'premium' && (
          <TouchableOpacity
            onPress={handleCancelSubscription}
            className="bg-red-500/20 border border-red-500 py-3 px-4 rounded-xl"
          >
            <Text className="text-red-400 text-center font-medium">
              Cancelar Suscripción
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default SubscriptionStatus;
