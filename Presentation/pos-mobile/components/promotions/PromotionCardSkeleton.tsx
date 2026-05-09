import { Skeleton } from "moti/skeleton";
import React, { FC } from "react";
import { View } from "react-native";

const PromotionCardSkeleton: FC = () => {
  return (
    <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-slate-50">
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1 pr-4">
          <Skeleton colorMode="light" width={80} height={20} radius={6} />
          <View className="h-3" />
          <Skeleton colorMode="light" width="90%" height={24} radius={8} />
          <View className="h-2" />
          <Skeleton colorMode="light" width="60%" height={16} radius={6} />
        </View>
        <Skeleton colorMode="light" width={45} height={24} radius={20} />
      </View>

      <View className="bg-slate-50 rounded-2xl p-4 mb-4">
        <View className="flex-row justify-between items-center py-1 mb-2">
          <Skeleton colorMode="light" width={60} height={14} />
          <Skeleton colorMode="light" width={100} height={14} />
        </View>
        <View className="flex-row justify-between items-center py-1">
          <Skeleton colorMode="light" width={60} height={14} />
          <Skeleton colorMode="light" width={100} height={14} />
        </View>
      </View>

      <View className="flex-row justify-end items-center">
        <Skeleton colorMode="light" width={110} height={36} radius={12} />
      </View>
    </View>
  );
};

export default PromotionCardSkeleton;
