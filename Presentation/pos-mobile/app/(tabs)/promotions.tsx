import { Plus } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Hooks
import { useInventory } from "@/src/hooks/use-inventory";
import { usePromotions } from "@/src/hooks/use-promotions";
import { Promotion } from "@/src/types/promotion";

// Components
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { AddPromotionsModal } from "@/components/promotions/AddPromotionsModal";
import { EditPromotionModal } from "@/components/promotions/EditPromotionModal";
import { PromotionTable } from "@/components/promotions/PromotionTable";

export default function PromotionScreen() {
  const {
    promotions,
    loading,
    addPromotion,
    updatePromotion,
    removePromotion,
    refresh,
  } = usePromotions();

  const { products } = useInventory();

  // Visibility States
  const [addVisible, setAddVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);

  // 1. Safe Modal Triggers using requestAnimationFrame (Same as handlePeriodChange)
  const handleEditTrigger = useCallback((promo: Promotion) => {
    requestAnimationFrame(() => {
      setSelectedPromo(promo);
      setEditVisible(true);
    });
  }, []);

  const handleDeleteTrigger = useCallback((promo: Promotion) => {
    requestAnimationFrame(() => {
      setSelectedPromo(promo);
      setDeleteVisible(true);
    });
  }, []);

  const onConfirmDelete = async () => {
    if (selectedPromo) {
      await removePromotion(selectedPromo.mainProductId);
      setDeleteVisible(false);
      setSelectedPromo(null);
    }
  };

  // 2. Memoize the Table to prevent unnecessary re-renders during modal state changes
  const MemoizedTable = useMemo(
    () => (
      <PromotionTable
        promotions={promotions}
        loading={loading}
        onRefresh={refresh}
        onEdit={handleEditTrigger}
        onDelete={handleDeleteTrigger}
      />
    ),
    [promotions, loading, refresh, handleEditTrigger, handleDeleteTrigger],
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row justify-between items-end mb-8 mt-4">
          <View>
            <Text className="text-3xl font-black text-slate-900">
              Promotions
            </Text>
            <Text className="text-slate-500 font-medium">
              Bulk pricing & bundle engine
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setAddVisible(true)}
            className="bg-blue-600 w-14 h-14 rounded-2xl items-center justify-center shadow-xl shadow-blue-300 active:opacity-80"
          >
            <Plus color="white" size={28} />
          </TouchableOpacity>
        </View>

        {MemoizedTable}
      </View>

      {/* Create Modal */}
      <AddPromotionsModal
        isVisible={addVisible}
        onClose={() => setAddVisible(false)}
        onSave={addPromotion}
        products={products}
      />

      {/* Edit Modal */}
      <EditPromotionModal
        isVisible={editVisible}
        onClose={() => {
          setEditVisible(false);
          setSelectedPromo(null);
        }}
        onUpdate={updatePromotion}
        promotion={selectedPromo}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        visible={deleteVisible}
        title="Remove Promotion?"
        description={`This will delete all pricing tiers for ${selectedPromo?.productName}. This action cannot be undone.`}
        confirmLabel="Remove All"
        onConfirm={onConfirmDelete}
        onCancel={() => {
          setDeleteVisible(false);
          setSelectedPromo(null);
        }}
        variant="danger"
      />
    </SafeAreaView>
  );
}
