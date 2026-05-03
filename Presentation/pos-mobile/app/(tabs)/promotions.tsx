import { Plus, Search, SlidersHorizontal } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CreatePromotionModal from "../../components/promotions/CreatePromotionModal";
import EmptyPromotions from "../../components/promotions/EmptyPromotions";
import PromotionCard from "../../components/promotions/PromotionCard";
import { usePromotions } from "../../src/hooks/use-promotions";

export default function PromotionsScreen() {
  // Data & Actions from your TanStack hook
  const { promotions, isLoading, refresh, togglePromotion, removePromotion } =
    usePromotions();

  // Local UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter logic with strict null checks for TypeScript
  const filteredPromotions = useMemo(() => {
    return (promotions || []).filter((p) => {
      const nameMatch =
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
      const productMatch =
        p.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false;
      return nameMatch || productMatch;
    });
  }, [promotions, searchQuery]);

  if (isLoading && (promotions?.length ?? 0) === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      {/* --- HEADER SECTION --- */}
      <View className="bg-white px-6 pt-16 pb-6 shadow-sm border-b border-slate-100">
        <View className="flex-row justify-between items-end mb-6">
          <View>
            <Text className="text-sm font-black text-blue-600 uppercase tracking-widest mb-1">
              Store Strategy
            </Text>
            <Text className="text-3xl font-black text-slate-900">
              Promotions
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsModalOpen(true)}
            activeOpacity={0.7}
            className="bg-blue-600 w-12 h-12 rounded-2xl items-center justify-center shadow-lg shadow-blue-200"
          >
            <Plus color="white" size={28} />
          </TouchableOpacity>
        </View>

        {/* --- SEARCH & FILTER BAR --- */}
        <View className="flex-row gap-3">
          <View className="flex-1 flex-row items-center bg-slate-100 px-4 py-3 rounded-2xl">
            <Search size={18} color="#64748b" />
            <TextInput
              placeholder="Search deals or products..."
              className="flex-1 ml-3 font-semibold text-slate-700"
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity className="bg-slate-100 p-4 rounded-2xl items-center justify-center">
            <SlidersHorizontal size={20} color="#475569" />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- PROMOTIONS LIST --- */}
      <FlatList
        data={filteredPromotions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PromotionCard
            promotion={item}
            onToggle={() => togglePromotion(item.id)}
            onDelete={() => removePromotion(item.id)}
          />
        )}
        ListEmptyComponent={<EmptyPromotions />}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor="#2563eb"
            colors={["#2563eb"]}
          />
        }
      />

      {/* --- CREATE MODAL --- */}
      <CreatePromotionModal
        isVisible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </View>
  );
}
