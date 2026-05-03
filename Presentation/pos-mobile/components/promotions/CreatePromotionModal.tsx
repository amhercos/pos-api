import {
  Check,
  Package,
  Plus,
  Search,
  Trash2,
  X,
  Zap,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useInventory } from "../../src/hooks/use-inventory"; // Assuming you have an inventory hook
import { usePromotions } from "../../src/hooks/use-promotions";
import {
  CreatePromotionRequest,
  PromotionType,
} from "../../src/types/promotion";

interface CreatePromotionModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function CreatePromotionModal({
  isVisible,
  onClose,
}: CreatePromotionModalProps) {
  // --- Hooks ---
  const { addPromotion, isProcessing } = usePromotions();
  const { products } = useInventory(); // To fetch products for the picker

  // --- Form State ---
  const [type, setType] = useState<PromotionType>(PromotionType.Bulk);
  const [name, setName] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [tiers, setTiers] = useState([{ quantity: 1, price: 0 }]);

  // --- Tier Logic (CRUD within form) ---
  const addTier = () => setTiers([...tiers, { quantity: 1, price: 0 }]);

  const removeTier = (index: number) => {
    if (tiers.length > 1) {
      setTiers(tiers.filter((_, i) => i !== index));
    }
  };

  const updateTier = (
    index: number,
    field: "quantity" | "price",
    value: string,
  ) => {
    const newTiers = [...tiers];
    const numValue = parseFloat(value) || 0;
    if (field === "quantity") newTiers[index].quantity = numValue;
    if (field === "price") newTiers[index].price = numValue;
    setTiers(newTiers);
  };

  //submit handler
  const handleSubmit = () => {
    if (!name || !selectedProductId || tiers.some((t) => t.price <= 0)) return;

    const payload: CreatePromotionRequest = {
      name,
      type: typeof type === "number" ? PromotionType[type] : type,
      mainProductId: selectedProductId,
      isActive: true,
      tiers: tiers.map((t) => ({
        quantity: Number(t.quantity),
        price: Number(t.price),
      })),
    };
    addPromotion(payload, {
      onSuccess: () => {
        setName("");
        setSelectedProductId("");
        setProductSearch("");
        setTiers([{ quantity: 1, price: 0 }]);
        onClose();
      },
    });
  };

  // Filtered product list for the "picker"
  const filteredProducts = products
    ?.filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()))
    .slice(0, 3);

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-end bg-black/40"
      >
        <View className="bg-white rounded-t-[40px] h-[92%] px-6 pt-8 shadow-2xl">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-2xl font-black text-slate-900">
                New Promotion
              </Text>
              <Text className="text-slate-500 font-medium">
                Configure store strategy
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="bg-slate-100 p-2 rounded-full"
            >
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            {/* Strategy Type */}
            <View className="flex-row gap-3 mb-6">
              {[
                { id: PromotionType.Bulk, label: "Bulk", icon: Package },
                { id: PromotionType.Bundle, label: "Bundle", icon: Zap },
              ].map((strategy) => (
                <TouchableOpacity
                  key={strategy.id}
                  onPress={() => setType(strategy.id)}
                  className={`flex-1 flex-row items-center justify-center p-4 rounded-2xl border-2 ${
                    type === strategy.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-100 bg-white"
                  }`}
                >
                  <strategy.icon
                    size={20}
                    color={type === strategy.id ? "#2563eb" : "#94a3b8"}
                  />
                  <Text
                    className={`ml-2 font-bold ${type === strategy.id ? "text-blue-600" : "text-slate-400"}`}
                  >
                    {strategy.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Promo Name */}
            <View className="mb-6">
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Promotion Title
              </Text>
              <TextInput
                placeholder="e.g. Wholesale Price"
                className="bg-slate-50 p-4 rounded-2xl font-semibold text-slate-900 border border-slate-100"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Product Search / Picker */}
            <View className="mb-6">
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Apply to Product
              </Text>
              <View className="bg-slate-50 flex-row items-center px-4 py-1 rounded-2xl border border-slate-100">
                <Search size={18} color="#94a3b8" />
                <TextInput
                  placeholder="Search inventory..."
                  className="flex-1 p-3 font-semibold text-slate-900"
                  value={productSearch}
                  onChangeText={setProductSearch}
                />
              </View>

              {/* Product Search Results (Subtle List) */}
              {productSearch.length > 0 && !selectedProductId && (
                <View className="mt-2 bg-white rounded-2xl border border-slate-100 overflow-hidden">
                  {filteredProducts?.map((product) => (
                    <TouchableOpacity
                      key={product.id}
                      onPress={() => {
                        setSelectedProductId(product.id);
                        setProductSearch(product.name);
                      }}
                      className="p-4 border-b border-slate-50 active:bg-slate-50"
                    >
                      <Text className="font-bold text-slate-700">
                        {product.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Dynamic Tiers Management */}
            <View className="mb-10">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Pricing Tiers
                </Text>
                <TouchableOpacity
                  onPress={addTier}
                  className="flex-row items-center"
                >
                  <Plus size={16} color="#2563eb" />
                  <Text className="text-blue-600 font-bold ml-1">Add Tier</Text>
                </TouchableOpacity>
              </View>

              {tiers.map((tier, index) => (
                <View key={index} className="flex-row items-center gap-3 mb-3">
                  <View className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <TextInput
                      placeholder="Min Qty"
                      keyboardType="numeric"
                      className="font-bold text-slate-900 text-center"
                      onChangeText={(val) => updateTier(index, "quantity", val)}
                    />
                  </View>
                  <View className="flex-[2] bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <TextInput
                      placeholder="Unit Price (₱)"
                      keyboardType="numeric"
                      className="font-bold text-slate-900"
                      onChangeText={(val) => updateTier(index, "price", val)}
                    />
                  </View>
                  <TouchableOpacity onPress={() => removeTier(index)}>
                    <Trash2 size={20} color="#e11d48" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Footer Action */}
          <View className="py-8 border-t border-slate-100">
            <TouchableOpacity
              disabled={isProcessing}
              onPress={handleSubmit}
              className={`p-5 rounded-2xl flex-row justify-center items-center shadow-lg ${
                isProcessing ? "bg-slate-300" : "bg-blue-600 shadow-blue-200"
              }`}
            >
              {isProcessing ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Check size={20} color="white" />
                  <Text className="text-white font-black text-lg ml-2">
                    Create Promotion
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
