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
import { ConfirmationModal } from "../../components/ConfirmationModal";
import CreatePromotionModal from "../../components/promotions/CreatePromotionModal";
import EditPromotionModal from "../../components/promotions/EditPromotionModal"; // We will create this below
import EmptyPromotions from "../../components/promotions/EmptyPromotions";
import PromotionCard from "../../components/promotions/PromotionCard";
import PromotionCardSkeleton from "../../components/promotions/PromotionCardSkeleton";
import { usePromotions } from "../../src/hooks/use-promotions";
import { Promotion } from "../../src/types/promotion";

type PromotionListItem = Promotion | { isSkeleton: true; id: string };

export default function PromotionsScreen() {
  const { promotions, isLoading, refresh, togglePromotion, removePromotion } =
    usePromotions();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // Edit State
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(
    null,
  );

  // Delete Confirmation State
  const [promotionToDelete, setPromotionToDelete] = useState<string | null>(
    null,
  );

  const filteredPromotions = useMemo((): Promotion[] => {
    const data = promotions ?? [];
    return data.filter((p) => {
      const query = searchQuery.toLowerCase();
      return (
        p.name?.toLowerCase().includes(query) ||
        p.productName?.toLowerCase().includes(query)
      );
    });
  }, [promotions, searchQuery]);

  const isInitialLoading =
    isLoading && (!promotions || promotions.length === 0);

  const listData = useMemo((): PromotionListItem[] => {
    if (isInitialLoading) {
      return Array.from({ length: 4 }).map((_, i) => ({
        isSkeleton: true,
        id: `skeleton-${i}`,
      }));
    }
    return filteredPromotions;
  }, [isInitialLoading, filteredPromotions]);

  const handleDeleteConfirm = () => {
    if (promotionToDelete) {
      removePromotion(promotionToDelete);
      setPromotionToDelete(null);
    }
  };

  const renderItem: ListRenderItem<PromotionListItem> = ({ item }) => {
    if ("isSkeleton" in item) return <PromotionCardSkeleton />;

    return (
      <PromotionCard
        promotion={item}
        onToggle={(id) => togglePromotion(id)}
        onDelete={(id) => setPromotionToDelete(id)}
        onEdit={() => setEditingPromotion(item)}
      />
    );
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header logic remains the same */}
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
            onPress={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 w-12 h-12 rounded-2xl items-center justify-center shadow-lg"
          >
            <Plus color="white" size={28} />
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 flex-row items-center bg-slate-100 px-4 py-3 rounded-2xl">
            <Search size={18} color="#64748b" />
            <TextInput
              placeholder="Search deals..."
              className="flex-1 ml-3 font-semibold text-slate-700"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity className="bg-slate-100 p-4 rounded-2xl">
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
        refreshControl={
          <RefreshControl
            refreshing={isLoading && promotions.length > 0}
            onRefresh={refresh}
            tintColor="#2563eb"
          />
        }
      />

      {/* Modals */}
      <CreatePromotionModal
        isVisible={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {editingPromotion && (
        <EditPromotionModal
          isVisible={!!editingPromotion}
          promotion={editingPromotion}
          onClose={() => setEditingPromotion(null)}
        />
      )}

      <ConfirmationModal
        visible={!!promotionToDelete}
        title="Remove Promotion"
        description="Are you sure you want to delete this deal? This action cannot be undone."
        confirmLabel="Remove Deal"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPromotionToDelete(null)}
        variant="danger"
      />
    </View>
  );
}
