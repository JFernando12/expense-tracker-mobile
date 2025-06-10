import React from 'react';
import { View } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

const HeaderSkeleton: React.FC = () => {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center">
        <SkeletonLoader width={40} height={40} borderRadius={20} className="mr-3" />
        <View>
          <SkeletonLoader width={120} height={16} className="mb-1" />
          <SkeletonLoader width={80} height={12} />
        </View>
      </View>
      <SkeletonLoader width={40} height={40} borderRadius={20} />
    </View>
  );
};

export default HeaderSkeleton;
