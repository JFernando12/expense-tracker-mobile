import { useGlobalContext } from '@/lib/global-provider';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React from 'react';
import {
  Alert,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface PremiumGuardProps {
  children: React.ReactNode;
  feature: string;
  description?: string;
  showUpgradeButton?: boolean;
}

const PremiumGuard: React.FC<PremiumGuardProps> = ({
  children,
  feature,
  description = 'Esta función requiere una suscripción premium.',
  showUpgradeButton = true,
}) => {
  const { canAccessPremiumFeatures, appMode, isTrialActive } = useGlobalContext();

  const handleUpgrade = () => {
    Alert.alert(
      'Función Premium',
      `${feature} está disponible solo para usuarios premium. ${description}`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Actualizar',
          onPress: () => {
            router.push('/(root)/(modals)/loginModal?mode=upgrade');
          },
        },
      ]
    );
  };

  // If user has premium access, render the children
  if (canAccessPremiumFeatures) {
    return <>{children}</>;
  }

  // Otherwise, render the premium lock screen
  return (
    <View className="bg-secondary-100 rounded-2xl p-6 items-center">
      <View className="size-16 bg-accent-200/20 rounded-full items-center justify-center mb-4">
        <Ionicons name="star" size={32} color="#FF6B35" />
      </View>
      
      <Text className="text-white text-xl font-bold text-center mb-2">
        {feature}
      </Text>
      
      <Text className="text-neutral-300 text-center text-base mb-6 leading-6">
        {description}
      </Text>

      {appMode === 'free' && (
        <Text className="text-neutral-400 text-center text-sm mb-4">
          Modo actual: Gratuito
        </Text>
      )}

      {isTrialActive && (
        <View className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mb-4">
          <Text className="text-yellow-400 text-center text-sm">
            ¡Tu prueba gratuita incluye acceso a esta función!
          </Text>
        </View>
      )}

      {showUpgradeButton && (
        <TouchableOpacity
          onPress={handleUpgrade}
          className="bg-accent-200 py-3 px-6 rounded-xl"
        >
          <View className="flex-row items-center">
            <Ionicons name="star" size={16} color="white" />
            <Text className="text-white font-bold ml-2">
              Actualizar a Premium
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default PremiumGuard;
