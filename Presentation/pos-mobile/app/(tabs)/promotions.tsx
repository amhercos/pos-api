import { Plus, Search, SlidersHorizontal } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  ListRenderItem,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CreatePromotionModal from "../../components/promotions/CreatePromotionModal";
import EmptyPromotions from "../../components/promotions/EmptyPromotions";
import PromotionCard from "../../components/promotions/PromotionCard";
import PromotionCardSkeleton from "../../components/promotions/PromotionCardSkeleton";
import { usePromotions } from "../../src/hooks/use-promotions";
import { Promotion } from "../../src/types/promotion";

// Define a strict type for our list items
type PromotionListItem = Promotion | { isSkeleton: true; id: string };

export default function PromotionsScreen() {
  const { promotions, isLoading, refresh, togglePromotion, removePromotion } =
    usePromotions();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const filteredPromotions = useMemo((): Promotion[] => {
    const data = promotions ?? [];
    return data.filter((p) => {
      const query = searchQuery.toLowerCase();
      const nameMatch = p.name?.toLowerCase().includes(query) ?? false;
      const productMatch =
        p.productName?.toLowerCase().includes(query) ?? false;
      return nameMatch || productMatch;
    });
  }, [promotions, searchQuery]);

  // Determine the display state
  const isInitialLoading =
    isLoading && (!promotions || promotions.length === 0);

  // Generate strictly typed data for the FlatList
  const listData = useMemo((): PromotionListItem[] => {
    if (isInitialLoading) {
      return Array.from({ length: 4 }).map((_, i) => ({
        isSkeleton: true,
        id: `skeleton-${i}`,
      }));
    }
    return filteredPromotions;
  }, [isInitialLoading, filteredPromotions]);

  const renderItem: ListRenderItem<PromotionListItem> = ({ item }) => {
    if ("isSkeleton" in item) {
      return <PromotionCardSkeleton />;
    }

    return (
      <PromotionCard
        promotion={item}
        onToggle={(id) => togglePromotion(id)}
        onDelete={(id) => removePromotion(id)}
      />
    );
  };

  return (
    <View className="flex-1 bg-slate-50">
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

      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={!isLoading ? <EmptyPromotions /> : null}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && (promotions?.length ?? 0) > 0}
            onRefresh={refresh}
            tintColor="#2563eb"
            colors={["#2563eb"]}
          />
        }
      />

      <CreatePromotionModal
        isVisible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </View>
  );
}
