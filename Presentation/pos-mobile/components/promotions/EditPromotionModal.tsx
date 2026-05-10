import { X } from "lucide-react-native";
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
import { Promotion, UpdatePromotionRequest } from "../../src/types/promotion";

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
  const [tiers, setTiers] = useState(promotion.tiers);

  const updateTier = (
    index: number,
    field: "quantity" | "price",
    value: string,
  ) => {
    const newTiers = [...tiers];
    const numValue = parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
    if (field === "quantity") newTiers[index].quantity = Math.floor(numValue);
    if (field === "price") newTiers[index].price = numValue;
    setTiers(newTiers);
  };

  const handleUpdate = () => {
    const payload: UpdatePromotionRequest = {
      id: promotion.mainProductId, // Match backend Guid param
      name,
      isActive: promotion.isActive,
      tiers: tiers.map((t) => ({ quantity: t.quantity, price: t.price })),
    };

    updatePromotion(payload, { onSuccess: onClose });
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-end bg-black/40"
      >
        <View className="bg-white rounded-t-[40px] h-[70%] px-6 pt-8">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-black text-slate-900 uppercase">
              Edit Deal
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="bg-slate-100 p-2 rounded-full"
            >
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="mb-6">
              <Text className="text-[10px] font-black text-slate-400 uppercase mb-2">
                Deal Name
              </Text>
              <TextInput
                className="bg-slate-50 p-4 rounded-2xl font-bold text-slate-900 border border-slate-100"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View className="mb-10">
              <Text className="text-[10px] font-black text-slate-400 uppercase mb-4">
                Pricing Tiers
              </Text>
              {tiers.map((tier, index) => (
                <View key={index} className="flex-row items-center gap-2 mb-3">
                  <TextInput
                    className="flex-1 bg-slate-50 p-4 rounded-2xl font-black text-center"
                    keyboardType="numeric"
                    value={tier.quantity.toString()}
                    onChangeText={(v) => updateTier(index, "quantity", v)}
                  />
                  <TextInput
                    className="flex-[2] bg-slate-50 p-4 rounded-2xl font-black"
                    keyboardType="numeric"
                    value={tier.price.toString()}
                    onChangeText={(v) => updateTier(index, "price", v)}
                  />
                </View>
              ))}
            </View>
          </ScrollView>

          <View className="py-8 border-t border-slate-100">
            <TouchableOpacity
              onPress={handleUpdate}
              disabled={isProcessing}
              className="bg-slate-900 p-5 rounded-3xl flex-row justify-center items-center"
            >
              {isProcessing ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-black uppercase">
                  Update Strategy
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
