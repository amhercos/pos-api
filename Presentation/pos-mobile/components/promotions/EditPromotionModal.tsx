import { Save, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    Modal,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Promotion, UpdatePromotionRequest } from "../../src/types/promotion";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onUpdate: (command: UpdatePromotionRequest) => Promise<boolean>;
  promotion: Promotion | null;
}

export function EditPromotionModal({
  isVisible,
  onClose,
  onUpdate,
  promotion,
}: Props) {
  const [name, setName] = useState("");
  const [promoPrice, setPromoPrice] = useState("");
  const [promoQuantity, setPromoQuantity] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when promotion is passed in
  useEffect(() => {
    if (promotion) {
      setName(promotion.name);
      setPromoPrice(promotion.promoPrice.toString());
      setPromoQuantity(promotion.promoQuantity?.toString() || "");
      setIsActive(promotion.isActive);
    }
  }, [promotion]);

  const handleUpdate = async () => {
    if (!promotion || !name) return;

    setIsSubmitting(true);
    const command: UpdatePromotionRequest = {
      id: promotion.id,
      name,
      promoPrice: promoPrice ? parseFloat(promoPrice) : undefined,
      promoQuantity: promoQuantity ? parseInt(promoQuantity) : undefined,
      isActive,
    };

    const success = await onUpdate(command);
    setIsSubmitting(false);
    if (success) onClose();
  };

  if (!promotion) return null;

  return (
    <Modal visible={isVisible} animationType="fade" transparent>
      <View className="flex-1 bg-black/60 justify-center p-6">
        <View className="bg-white rounded-3xl p-6 shadow-2xl">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-xl font-bold text-gray-900">
                Edit Promotion
              </Text>
              <Text className="text-gray-500 text-xs">
                {promotion.productName}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
              <X color="#9ca3af" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Name Input */}
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Display Name
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 p-4 rounded-xl mb-4 text-gray-900"
              value={name}
              onChangeText={setName}
            />

            <View className="flex-row gap-4 mb-4">
              {/* Price Input */}
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Promo Price
                </Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-gray-900"
                  keyboardType="numeric"
                  value={promoPrice}
                  onChangeText={setPromoPrice}
                />
              </View>

              {/* Quantity Input */}
              {promotion.promoQuantity !== null && (
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Threshold Qty
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-gray-900"
                    keyboardType="numeric"
                    value={promoQuantity}
                    onChangeText={setPromoQuantity}
                  />
                </View>
              )}
            </View>

            {/* Status Switch */}
            <View className="flex-row justify-between items-center bg-gray-50 p-4 rounded-xl mb-6">
              <View>
                <Text className="font-bold text-gray-800">Active Status</Text>
                <Text className="text-gray-500 text-xs">
                  Is this deal currently live?
                </Text>
              </View>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: "#d1d5db", true: "#93c5fd" }}
                thumbColor={isActive ? "#2563eb" : "#f4f3f4"}
              />
            </View>

            {/* Action Button */}
            <TouchableOpacity
              onPress={handleUpdate}
              disabled={isSubmitting}
              className={`p-4 rounded-2xl flex-row justify-center items-center ${
                isSubmitting ? "bg-gray-400" : "bg-blue-600"
              }`}
            >
              <Save size={20} color="white" />
              <Text className="text-white font-bold ml-2 text-lg">
                {isSubmitting ? "Updating..." : "Save Changes"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
