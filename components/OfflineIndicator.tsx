import { useTranslation } from '@/lib/i18n/useTranslation';
import { networkService } from '@/lib/services/networkService';
import React, { useEffect, useState } from 'react';
import { Animated, Text } from 'react-native';

const OfflineIndicator: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-50));
  const { t } = useTranslation();

  useEffect(() => {
    const checkInitialStatus = async () => {
      const isOnline = networkService.isOnline();
      setIsOffline(!isOnline);
    };

    checkInitialStatus();

    const unsubscribe = networkService.onNetworkChange((isConnected) => {
      setIsOffline(!isConnected);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isOffline) {
      // Slide down
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Slide up
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOffline, slideAnim]);

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
      className="bg-red-500 px-4 py-2 mx-4 mt-2 rounded-lg"
    >
      <Text className="text-white text-center text-sm font-medium">
        {t('offline.message')}
      </Text>
    </Animated.View>
  );
};

export default OfflineIndicator;
