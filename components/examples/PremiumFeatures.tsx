import PremiumGuard from '@/components/PremiumGuard';
import { useGlobalContext } from '@/lib/global-provider';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const AdvancedStatistics = () => {
  const { canAccessPremiumFeatures } = useGlobalContext();

  // Example premium feature content
  const PremiumContent = () => (
    <View className="bg-secondary-100 rounded-2xl p-4">
      <View className="flex-row items-center mb-3">
        <Ionicons name="analytics" size={24} color="#FF6B35" />
        <Text className="text-white text-lg font-bold ml-3">
          Estadísticas Avanzadas
        </Text>
      </View>
      
      <View className="space-y-3">
        <View className="bg-primary-200 rounded-xl p-3">
          <Text className="text-neutral-300 text-sm">Análisis de tendencias</Text>
          <Text className="text-white text-xl font-bold">+15% este mes</Text>
        </View>
        
        <View className="bg-primary-200 rounded-xl p-3">
          <Text className="text-neutral-300 text-sm">Predicciones IA</Text>
          <Text className="text-white text-xl font-bold">$2,340 proyectado</Text>
        </View>
        
        <View className="bg-primary-200 rounded-xl p-3">
          <Text className="text-neutral-300 text-sm">Alertas inteligentes</Text>
          <Text className="text-green-400 text-base">Todo bajo control</Text>
        </View>
      </View>
    </View>
  );

  return (
    <PremiumGuard
      feature="Estadísticas Avanzadas"
      description="Obtén insights profundos sobre tus gastos con análisis de tendencias, predicciones con IA y alertas inteligentes."
    >
      <PremiumContent />
    </PremiumGuard>
  );
};

// Example of a simpler premium feature
export const ExportFeature = () => {
  const { canAccessPremiumFeatures } = useGlobalContext();

  const handleExport = () => {
    // Export logic here
    console.log('Exporting data...');
  };

  return (
    <PremiumGuard
      feature="Exportar Datos"
      description="Exporta tus datos en formato CSV o PDF para análisis externos."
      showUpgradeButton={true}
    >
      <TouchableOpacity
        onPress={handleExport}
        className="bg-blue-500 py-3 px-4 rounded-xl flex-row items-center justify-center"
      >
        <Ionicons name="download" size={20} color="white" />
        <Text className="text-white font-bold ml-2">Exportar Datos</Text>
      </TouchableOpacity>
    </PremiumGuard>
  );
};

export default AdvancedStatistics;
