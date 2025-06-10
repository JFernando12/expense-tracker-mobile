import React from 'react';
import { View } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

const BalanceSkeleton: React.FC = () => {
  return (
    <View className="bg-primary-300 p-6 rounded-3xl mt-3 shadow-lg">
      {/* Total Balance Label */}
      <SkeletonLoader width={100} height={18} className="mb-1" />
      
      {/* Balance Amount */}
      <SkeletonLoader width={150} height={36} className="mb-6" />
      
      {/* Income and Expenses Row */}
      <View className="flex-row items-center justify-between">
        {/* Income Section */}
        <View className="flex-row items-center">
          <SkeletonLoader width={32} height={32} borderRadius={16} className="mr-3" />
          <View>
            <SkeletonLoader width={60} height={14} className="mb-1" />
            <SkeletonLoader width={80} height={18} />
          </View>
        </View>
        
        {/* Expenses Section */}
        <View className="flex-row items-center">
          <SkeletonLoader width={32} height={32} borderRadius={16} className="mr-3" />
          <View>
            <SkeletonLoader width={70} height={14} className="mb-1" />
            <SkeletonLoader width={80} height={18} />
          </View>
        </View>
      </View>
    </View>
  );
};

export default BalanceSkeleton;
