import { Plus, Search } from "lucide-react-native";
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
import EditPromotionModal from "../../components/promotions/EditPromotionModal";
import EmptyPromotions from "../../components/promotions/EmptyPromotions";
import PromotionCard from "../../components/promotions/PromotionCard";
import PromotionCardSkeleton from "../../components/promotions/PromotionCardSkeleton";
import { usePromotions } from "../../src/hooks/use-promotions";
import { cn } from "../../src/lib/utils";
import { Promotion } from "../../src/types/promotion";

type PromotionListItem = Promotion | { isSkeleton: true; id: string };
type StrategyFilter = "All" | "Discount" | "Bulk" | "Bundle";

interface BackendPromotionShape extends Promotion {
  promotionType?: string;
}

const STRATEGIES: StrategyFilter[] = ["All", "Discount", "Bulk", "Bundle"];

export default function PromotionsScreen() {
  const { promotions, isLoading, refresh, togglePromotion, removePromotion } =
    usePromotions();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStrategy, setSelectedStrategy] =
    useState<StrategyFilter>("All");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(
    null,
  );
  const [promotionToDelete, setPromotionToDelete] = useState<string | null>(
    null,
  );

  const filteredPromotions = useMemo((): Promotion[] => {
    const data = (promotions as BackendPromotionShape[]) ?? [];
    return data.filter((p) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        p.name?.toLowerCase().includes(query) ||
        p.productName?.toLowerCase().includes(query);

      const resolvedType = p.type || p.promotionType || "";
      const matchesStrategy =
        selectedStrategy === "All" ||
        String(resolvedType).toLowerCase() === selectedStrategy.toLowerCase();

      return matchesSearch && matchesStrategy;
    });
  }, [promotions, searchQuery, selectedStrategy]);

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
    <View className="flex-1 bg-white">
      <View className="bg-white px-5 pt-4 pb-3 border-b border-slate-100">
        <View className="flex-row gap-2 items-center mb-3">
          <View className="flex-1 flex-row items-center bg-slate-100 rounded-2xl px-4 h-12">
            <Search size={18} color="#94a3b8" />
            <TextInput
              placeholder="Search active promotions..."
              className="flex-1 ml-2 text-slate-900 font-bold h-full p-0"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            onPress={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 w-12 h-12 rounded-2xl items-center justify-center shadow-sm"
            activeOpacity={0.85}
          >
            <Plus color="white" size={22} strokeWidth={3} />
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-2 mt-1">
          {STRATEGIES.map((strat) => {
            const isActive = selectedStrategy === strat;
            return (
              <TouchableOpacity
                key={strat}
                onPress={() => setSelectedStrategy(strat)}
                className={cn(
                  "px-4 h-8 rounded-full justify-center items-center border",
                  isActive
                    ? "bg-slate-900 border-slate-900"
                    : "bg-white border-slate-200",
                )}
                activeOpacity={0.8}
              >
                <Text
                  className={cn(
                    "text-[11px] font-black uppercase tracking-wider",
                    isActive ? "text-white" : "text-slate-400",
                  )}
                >
                  {strat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={!isLoading ? <EmptyPromotions /> : null}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
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
