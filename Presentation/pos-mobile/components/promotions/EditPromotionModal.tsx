import { Layers, Plus, Save, Tag, Trash2, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  PromoTier,
  Promotion,
  PromotionType,
  UpdatePromotionRequest,
} from "../../src/types/promotion";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onUpdate: (id: string, command: UpdatePromotionRequest) => Promise<boolean>;
  promotion: Promotion | null;
}

export function EditPromotionModal({
  isVisible,
  onClose,
  onUpdate,
  promotion,
}: Props) {
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [tiers, setTiers] = useState<PromoTier[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (promotion) {
      setName(promotion.productName || promotion.productName);
      setIsActive(promotion.isActive);
      setTiers(promotion.tiers.map((t) => ({ ...t })));
    }
  }, [promotion]);

  const handleUpdateTier = (
    index: number,
    field: keyof PromoTier,
    value: string,
  ) => {
    const cleanedValue = value.replace(/[^0-9.]/g, "");
    const numericValue = cleanedValue === "" ? 0 : parseFloat(cleanedValue);

    setTiers((prev) => {
      const newTiers = [...prev];
      newTiers[index] = { ...newTiers[index], [field]: numericValue };
      return newTiers;
    });
  };

  const handleAddTier = () => {
    // Logic: Default new tier to 1 unit more than the previous max tier
    const lastQty = tiers.length > 0 ? tiers[tiers.length - 1].quantity : 1;
    setTiers([...tiers, { quantity: lastQty + 1, price: 0 }]);
  };

  const handleRemoveTier = (index: number) => {
    if (tiers.length > 1) {
      setTiers((prev) => prev.filter((_, i) => i !== index));
    } else {
      Alert.alert(
        "Action Denied",
        "A promotion requires at least one pricing tier.",
      );
    }
  };

  const handleUpdate = async () => {
    if (!promotion || !name) return;

    const validTiers = tiers.filter((t) => t.price > 0);
    if (validTiers.length === 0) {
      Alert.alert(
        "Validation Error",
        "Please provide at least one valid price.",
      );
      return;
    }

    setIsSubmitting(true);
    const command: UpdatePromotionRequest = {
      mainProductId: promotion.mainProductId,
      name,
      type: promotion.type,
      tiers: validTiers,
      isActive,
      tieUpProductId: promotion.tieUpProductId,
    };

    const success = await onUpdate(promotion.mainProductId, command);
    setIsSubmitting(false);
    if (success) onClose();
  };

  if (!promotion) return null;

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-slate-900/60 justify-end"
      >
        <View className="bg-white rounded-t-[40px] h-[90%] p-8 shadow-2xl">
          {/* Header Section */}
          <View className="flex-row justify-between items-start mb-6">
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <View className="bg-blue-100 px-2 py-1 rounded-md mr-2">
                  <Text className="text-[9px] font-black text-blue-700 uppercase">
                    {PromotionType[promotion.type]}
                  </Text>
                </View>
                <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter">
                  Campaign Editor
                </Text>
              </View>
              <Text
                className="text-2xl font-black text-slate-900"
                numberOfLines={1}
              >
                {promotion.productName}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="bg-slate-100 p-2 rounded-full"
            >
              <X color="#64748b" size={20} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            <View className="gap-y-6">
              {/* Product Info Card (Read Only) */}
              <View className="bg-slate-50 border border-slate-100 p-4 rounded-3xl flex-row items-center">
                <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center border border-slate-100 shadow-sm">
                  {promotion.type === PromotionType.Bulk ? (
                    <Layers size={20} color="#64748b" />
                  ) : (
                    <Tag size={20} color="#64748b" />
                  )}
                </View>
                <View className="ml-4">
                  <Text className="text-slate-400 text-[10px] font-bold uppercase">
                    Linked Product ID
                  </Text>
                  <Text className="text-slate-900 font-mono text-xs">
                    {promotion.mainProductId.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Input: Promotion Name */}
              <View>
                <Text className="text-[10px] font-black uppercase text-slate-500 mb-2 ml-1 tracking-widest">
                  Display Name
                </Text>
                <TextInput
                  className="bg-white p-4 rounded-2xl font-bold text-slate-900 border border-slate-200 focus:border-blue-500"
                  value={name}
                  onChangeText={setName}
                  placeholder="Internal campaign title..."
                />
              </View>

              {/* Status Switch */}
              <View className="flex-row justify-between items-center bg-slate-900 p-5 rounded-[32px]">
                <View>
                  <Text className="font-bold text-white">Active Status</Text>
                  <Text className="text-slate-400 text-[10px]">
                    Visible to customers in checkout
                  </Text>
                </View>
                <Switch
                  value={isActive}
                  onValueChange={setIsActive}
                  trackColor={{ false: "#475569", true: "#3b82f6" }}
                  thumbColor="#ffffff"
                />
              </View>

              {/* Tiers Section */}
              <View>
                <View className="flex-row justify-between items-end mb-4 px-1">
                  <View>
                    <Text className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                      Price Configuration
                    </Text>
                    <Text className="text-slate-400 text-[11px]">
                      Define volume-based triggers
                    </Text>
                  </View>
                  {promotion.type === PromotionType.Bulk && (
                    <TouchableOpacity
                      onPress={handleAddTier}
                      className="bg-blue-50 px-3 py-2 rounded-xl flex-row items-center border border-blue-100"
                    >
                      <Plus size={14} color="#2563eb" />
                      <Text className="text-blue-600 font-bold text-[10px] ml-1">
                        ADD TIER
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {tiers.map((tier, index) => (
                  <View
                    key={`tier-${index}`}
                    className="mb-4 bg-slate-50 border border-slate-100 rounded-[24px] p-4"
                  >
                    <View className="flex-row justify-between items-center mb-3">
                      <View className="flex-row items-center">
                        <View className="w-5 h-5 bg-slate-200 rounded-full items-center justify-center mr-2">
                          <Text className="text-[9px] font-bold text-slate-600">
                            {index + 1}
                          </Text>
                        </View>
                        <Text className="text-[10px] font-black text-slate-400 uppercase">
                          Tier Logic
                        </Text>
                      </View>
                      {tiers.length > 1 && (
                        <TouchableOpacity
                          onPress={() => handleRemoveTier(index)}
                        >
                          <Trash2 size={16} color="#ef4444" />
                        </TouchableOpacity>
                      )}
                    </View>

                    <View className="flex-row gap-x-3">
                      {/* Condition Input */}
                      <View className="flex-1">
                        <Text className="text-[9px] font-bold text-slate-400 mb-1 ml-1 uppercase">
                          If Qty is ≥
                        </Text>
                        <TextInput
                          className="bg-white p-4 rounded-xl font-black text-slate-900 border border-slate-200"
                          keyboardType="numeric"
                          value={tier.quantity.toString()}
                          onChangeText={(v) =>
                            handleUpdateTier(index, "quantity", v)
                          }
                          editable={promotion.type === PromotionType.Bulk}
                        />
                      </View>

                      {/* Result Input */}
                      <View className="flex-[1.5]">
                        <Text className="text-[9px] font-bold text-slate-400 mb-1 ml-1 uppercase">
                          Apply Price
                        </Text>
                        <View className="flex-row items-center bg-white rounded-xl border border-slate-200 px-3">
                          <Text className="text-slate-400 font-bold">₱</Text>
                          <TextInput
                            className="flex-1 p-4 font-black text-blue-600"
                            keyboardType="decimal-pad"
                            placeholder="0.00"
                            value={
                              tier.price === 0 ? "" : tier.price.toString()
                            }
                            onChangeText={(v) =>
                              handleUpdateTier(index, "price", v)
                            }
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
            <View className="h-10" />
          </ScrollView>

          {/* Footer Action */}
          <View className="pt-6 border-t border-slate-100">
            <TouchableOpacity
              onPress={handleUpdate}
              disabled={isSubmitting}
              activeOpacity={0.8}
              className={`h-16 rounded-[24px] flex-row justify-center items-center shadow-sm ${
                isSubmitting ? "bg-slate-200" : "bg-blue-600"
              }`}
            >
              {isSubmitting ? (
                <Text className="text-slate-500 font-bold uppercase tracking-widest">
                  Saving...
                </Text>
              ) : (
                <>
                  <Save size={18} color="white" />
                  <Text className="text-white font-black ml-3 text-sm uppercase tracking-widest">
                    Update Campaign
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
