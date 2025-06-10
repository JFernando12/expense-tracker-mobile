import React from 'react';
import { View } from 'react-native';
import BalanceSkeleton from './BalanceSkeleton';
import HeaderSkeleton from './HeaderSkeleton';
import SkeletonLoader from './SkeletonLoader';

const HomeSkeleton: React.FC = () => {
  return (
    <View className="bg-primary-100 h-full p-5">
      {/* Header Skeleton */}
      <HeaderSkeleton />
      
      {/* Balance Section Skeleton */}
      <BalanceSkeleton />
      
      {/* Recent Transactions Header Skeleton */}
      <View className="flex-row items-center justify-between mt-3">
        <SkeletonLoader width={120} height={24} className="mb-1" />
        <SkeletonLoader width={40} height={40} borderRadius={20} />
      </View>
      
      {/* Transaction List Skeleton */}
      <View className="flex-1 mt-3">
        {[...Array(6)].map((_, index) => (
          <View
            key={index}
            className="bg-secondary-100 flex-row items-center justify-between p-5 rounded-2xl mb-3 shadow-sm"
          >
            {/* Left side - Icon and details */}
            <View className="flex-row items-center">
              {/* Category Icon */}
              <SkeletonLoader width={48} height={48} borderRadius={24} className="mr-3" />
              <View>
                {/* Category name */}
                <SkeletonLoader width={100} height={18} className="mb-1" />
                {/* Description */}
                <SkeletonLoader width={140} height={14} />
              </View>
            </View>
            
            {/* Right side - Amount and date */}
            <View className="items-end">
              {/* Amount */}
              <SkeletonLoader width={80} height={18} className="mb-1" />
              {/* Date */}
              <SkeletonLoader width={60} height={14} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default HomeSkeleton;
