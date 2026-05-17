import { cn } from "@/src/lib/utils";
import { Info, Plus, Trash2, X } from "lucide-react-native";
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
import { usePromotions } from "../../src/hooks/use-promotions";
import {
  Promotion,
  PromotionType,
  UpdatePromotionRequest,
} from "../../src/types/promotion";

interface EditPromotionModalProps {
  isVisible: boolean;
  promotion: Promotion;
  onClose: () => void;
}

export default function EditPromotionModal({
  isVisible,
  promotion,
  onClose,
}: EditPromotionModalProps) {
  const { updatePromotion, isProcessing } = usePromotions();
  const [name, setName] = useState(promotion.name);
  const [tiers, setTiers] = useState(() =>
    promotion.tiers.map((t) => ({
      id: t.id,
      quantity: t.quantity,
      price: t.price,
    })),
  );

  const isBulk =
    promotion.type === PromotionType.Bulk || promotion.type === "Bulk";
  const isBundle =
    promotion.type === PromotionType.Bundle || promotion.type === "Bundle";
  const isDiscount =
    promotion.type === PromotionType.Discount || promotion.type === "Discount";

  const updateTier = (
    index: number,
    field: "quantity" | "price",
    value: string,
  ) => {
    const newTiers = [...tiers];
    const cleaned = value.replace(/[^0-9.]/g, "");
    const numValue = cleaned === "" ? 0 : parseFloat(cleaned);

    if (field === "quantity") newTiers[index].quantity = Math.floor(numValue);
    if (field === "price") newTiers[index].price = numValue;
    setTiers(newTiers);
  };

  const addTier = () => {
    setTiers([...tiers, { id: undefined, quantity: 1, price: 0 }]);
  };

  const removeTier = (index: number) => {
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const handleUpdate = () => {
    const payload: UpdatePromotionRequest = {
      id: promotion.id,
      mainProductId: promotion.mainProductId,
      name,
      type: promotion.type as string,
      isActive: promotion.isActive,
      tiers: tiers.map((t) => ({ quantity: t.quantity, price: t.price })),
      tieUpProductId: promotion.tieUpProductId,
      tieUpQuantity: promotion.tieUpQuantity,
    };

    updatePromotion(payload, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-end bg-black/50"
      >
        <View className="bg-white rounded-t-[40px] h-[85%] px-6 pt-8 shadow-2xl">
          {/* --- HEADER --- */}
          <View className="flex-row justify-between items-center mb-5">
            <View className="flex-1 pr-2">
              <Text className="text-xs font-black uppercase tracking-widest text-blue-600 mb-0.5">
                Modify Promotion Strategy
              </Text>
              <Text
                className="text-2xl font-black text-slate-900 tracking-tight"
                numberOfLines={1}
              >
                {promotion.productName ?? "Unknown Item"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="bg-slate-100 p-2.5 rounded-full"
            >
              <X size={18} color="#475569" />
            </TouchableOpacity>
          </View>

          {/* --- SYSTEM EXPLANATION HINT BOX --- */}
          <View className="bg-blue-50/70 border border-blue-100 p-3.5 rounded-2xl flex-row items-start mb-5">
            <Info size={16} color="#2563eb" style={{ marginTop: 2 }} />
            <Text className="text-blue-900 text-xs font-semibold ml-2.5 flex-1 leading-4">
              {isDiscount &&
                "Flat Discount mode changes the single unit base price. Modifying this structure directly overrides standard item logic on active POS runs."}
              {isBulk &&
                "Bulk settings use quantity breaks. Set absolute wholesale group tier limits (e.g. 3x items total cash register charge price)."}
              {isBundle &&
                `Bundle rule binds this product with another secondary requirement. Must cross-verify rules carefully.`}
            </Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            {/* --- NAME INPUT --- */}
            <View className="mb-5">
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">
                Administrative Label Name
              </Text>
              <TextInput
                className="bg-slate-50 p-4 rounded-2xl font-bold text-slate-900 border border-slate-100 text-sm"
                value={name}
                onChangeText={setName}
                placeholder="Give this promotion plan a label..."
              />
            </View>

            {/* --- PRICING TIERS LIST --- */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-3 ml-1">
                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  {isDiscount
                    ? "Active Discount Value"
                    : "Target Pricing Configuration Table"}
                </Text>

                {isBulk && (
                  <TouchableOpacity
                    onPress={addTier}
                    className="flex-row items-center bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100"
                  >
                    <Plus size={12} color="#2563eb" />
                    <Text className="text-blue-700 font-black text-[10px] uppercase ml-1">
                      Add Tier
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {tiers.length === 0 ? (
                <View className="bg-slate-50 rounded-2xl p-6 items-center border border-dashed border-slate-200">
                  <Text className="text-slate-400 font-bold text-xs">
                    No active price breaks configure.
                  </Text>
                </View>
              ) : (
                tiers.map((tier, index) => (
                  <View
                    key={index}
                    className="flex-row items-end gap-2 mb-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100"
                  >
                    <View className="flex-1">
                      <Text className="text-[9px] font-black text-slate-400 mb-1.5 ml-1">
                        MIN QTY
                      </Text>
                      <TextInput
                        className={cn(
                          "bg-white p-3.5 rounded-xl font-black text-center text-slate-900 border border-slate-200/60 text-sm",
                          isDiscount && "bg-slate-100 text-slate-400",
                        )}
                        keyboardType="number-pad"
                        editable={!isDiscount}
                        value={tier.quantity.toString()}
                        onChangeText={(v) => updateTier(index, "quantity", v)}
                      />
                    </View>

                    <View className="flex-[2.5]">
                      <Text className="text-[9px] font-black text-slate-400 mb-1.5 ml-1">
                        {isBulk
                          ? "TOTAL PACK PROMO CHARGE (₱)"
                          : "PROMO RETAIL PRICE EACH (₱)"}
                      </Text>
                      <TextInput
                        className="bg-white p-3.5 rounded-xl font-black text-slate-900 border border-slate-200/60 text-sm"
                        keyboardType="decimal-pad"
                        value={tier.price === 0 ? "" : tier.price.toString()}
                        placeholder="0.00"
                        onChangeText={(v) => updateTier(index, "price", v)}
                      />
                    </View>

                    {isBulk && tiers.length > 1 && (
                      <TouchableOpacity
                        onPress={() => removeTier(index)}
                        className="bg-rose-50 p-3.5 rounded-xl border border-rose-100 items-center justify-center mb-[1px]"
                      >
                        <Trash2 size={16} color="#e11d48" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              )}
            </View>
          </ScrollView>

          {/* --- FOOTER ACTION BAR --- */}
          <View className="p-5 border-t border-slate-50 bg-white">
            <TouchableOpacity
              onPress={handleUpdate}
              disabled={isProcessing}
              activeOpacity={0.8}
              className={cn(
                "h-14 rounded-2xl flex-row justify-center items-center shadow-lg",
                isProcessing ? "bg-slate-200" : "bg-slate-900 shadow-slate-300",
              )}
            >
              {isProcessing ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-black text-sm ml-2 uppercase tracking-widest">
                  Save Changes & Push Live
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
