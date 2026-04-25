import { Edit3, Plus, Tag, Trash2 } from "lucide-react-native";
import { Skeleton } from "moti/skeleton";
import React, { useState } from "react";
import {
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Internal Hooks & Types
import { useInventory } from "@/src/hooks/use-inventory";
import { usePromotions } from "@/src/hooks/use-promotions";
import { Promotion } from "../../src/types/promotion";

// Components
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { AddPromotionsModal } from "../../components/promotions/AddPromotionsModal";
import { EditPromotionModal } from "../../components/promotions/EditPromotionModal";

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

  // Modal Visibility States
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // Selected Item States
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(
    null,
  );

  const PromotionSkeleton = () => (
    <View className="bg-white p-4 mb-3 rounded-2xl border border-gray-100 flex-row justify-between items-center">
      <View className="flex-1 gap-y-2">
        <Skeleton colorMode="light" width={100} height={12} />
        <Skeleton colorMode="light" width={200} height={20} />
        <Skeleton colorMode="light" width={150} height={16} />
      </View>
      <View className="ml-4">
        <Skeleton colorMode="light" radius="round" width={40} height={40} />
      </View>
    </View>
  );

  const handleDeletePress = (promo: Promotion) => {
    setSelectedPromotion(promo);
    setDeleteModalVisible(true);
  };

  const handleEditPress = (promo: Promotion) => {
    setSelectedPromotion(promo);
    setEditModalVisible(true);
  };

  const confirmDelete = async () => {
    if (selectedPromotion) {
      await removePromotion(selectedPromotion.id);
      setDeleteModalVisible(false);
      setSelectedPromotion(null);
    }
  };

  const renderItem = ({ item }: { item: Promotion }) => (
    <View
      className={`bg-white p-4 mb-3 rounded-2xl shadow-sm border ${
        item.isActive ? "border-gray-100" : "border-gray-200 opacity-60"
      } flex-row justify-between items-center`}
    >
      <TouchableOpacity
        onPress={() => handleEditPress(item)}
        className="flex-1"
      >
        <View className="flex-row items-center gap-2 mb-1">
          <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-tighter">
            {item.name}
          </Text>
          {!item.isActive && (
            <View className="bg-gray-200 px-2 py-0.5 rounded-full">
              <Text className="text-[8px] font-bold text-gray-600">
                INACTIVE
              </Text>
            </View>
          )}
        </View>

        <Text className="text-lg font-bold text-gray-800">
          {item.productName}
        </Text>

        <View className="flex-row items-center mt-1">
          <Text className="text-blue-600 font-bold text-base">
            ₱{item.promoPrice}
          </Text>
          {item.promoQuantity && item.promoQuantity > 0 && (
            <Text className="text-gray-500 text-sm ml-1">
              / {item.promoQuantity} units
            </Text>
          )}
          <Text className="text-gray-400 text-xs line-through ml-2">
            ₱{item.originalPrice}
          </Text>
        </View>
      </TouchableOpacity>

      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          onPress={() => handleEditPress(item)}
          className="bg-blue-50 p-2 rounded-full active:bg-blue-100"
        >
          <Edit3 size={18} color="#2563eb" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleDeletePress(item)}
          className="bg-red-50 p-2 rounded-full active:bg-red-100"
        >
          <Trash2 size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 p-4">
        {/* Header Section */}
        <View className="flex-row justify-between items-center mb-6 mt-2">
          <View>
            <Text className="text-2xl font-bold text-gray-900">
              Special Pricing
            </Text>
            <Text className="text-gray-500 text-sm font-medium">
              Manage your bulk and bundle deals
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setAddModalVisible(true)}
            className="bg-blue-600 p-3 rounded-full shadow-lg shadow-blue-400 active:bg-blue-700"
          >
            <Plus color="white" size={24} />
          </TouchableOpacity>
        </View>

        {/* Content Section */}
        {loading && promotions.length === 0 ? (
          <View>
            <PromotionSkeleton />
            <PromotionSkeleton />
            <PromotionSkeleton />
            <PromotionSkeleton />
          </View>
        ) : (
          <FlatList
            data={promotions}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={refresh}
                tintColor="#2563eb"
              />
            }
            ListEmptyComponent={
              <View className="items-center mt-20 opacity-40">
                <Tag color="#9ca3af" size={64} strokeWidth={1.5} />
                <Text className="text-gray-500 mt-4 font-black text-lg">
                  No active promotions
                </Text>
                <Text className="text-gray-400 text-[15px] font-medium">
                  Tap the + button to create a new deal
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* Modals */}
      <AddPromotionsModal
        isVisible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSave={addPromotion}
        products={products}
      />

      <EditPromotionModal
        isVisible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedPromotion(null);
        }}
        onUpdate={updatePromotion}
        promotion={selectedPromotion}
      />

      <ConfirmationModal
        visible={deleteModalVisible}
        title="Delete Promotion?"
        description={`Are you sure you want to remove "${selectedPromotion?.name}"? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedPromotion(null);
        }}
        variant="danger"
      />
    </SafeAreaView>
  );
}
