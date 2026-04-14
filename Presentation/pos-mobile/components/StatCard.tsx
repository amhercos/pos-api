import React from "react";
import { Text, View } from "react-native";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  className?: string;
}

export function StatCard({ title, value, icon, className }: StatCardProps) {
  return (
    <View className={`bg-slate-50/50 p-4 rounded-2xl flex-1 ${className}`}>
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {title}
        </Text>
        {icon}
      </View>
      <Text className="text-xl font-black text-slate-900 tracking-tight">
        {value}
      </Text>
    </View>
  );
}
