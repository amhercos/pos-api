import { cn } from "@/src/lib/utils";
import {
  ArrowRight,
  Check,
  Layers,
  Link as LinkIcon,
  Package,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react-native";
import React, { FC, useMemo, useState } from "react";
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
import { useInventory } from "../../src/hooks/use-inventory";
import { usePromotions } from "../../src/hooks/use-promotions";
import {
  CreatePromotionRequest,
  PromotionTier,
  PromotionType,
} from "../../src/types/promotion";

interface CreatePromotionModalProps {
  isVisible: boolean;
  onClose: () => void;
}

type TierInput = Omit<PromotionTier, "id" | "promotionId">;

interface StrategyOption {
  id: PromotionType;
  label: string;
  icon: FC<{ size: number; color: string }>;
}

const STRATEGIES: StrategyOption[] = [
  { id: PromotionType.Bulk, label: "Bulk", icon: Package },
  { id: PromotionType.Bundle, label: "Bundle", icon: Layers },
  { id: PromotionType.Discount, label: "Discount", icon: Tag },
];

export default function CreatePromotionModal({
  isVisible,
  onClose,
}: CreatePromotionModalProps) {
  const { addPromotion, isProcessing } = usePromotions();
  const { products } = useInventory();

  const [type, setType] = useState<PromotionType>(PromotionType.Bulk);
  const [name, setName] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [productSearch, setProductSearch] = useState<string>("");

  const [tieUpProductId, setTieUpProductId] = useState<string | null>(null);
  const [tieUpSearch, setTieUpSearch] = useState<string>("");
  const [tieUpQuantity, setTieUpQuantity] = useState<number>(1);

  const [tiers, setTiers] = useState<TierInput[]>([{ quantity: 1, price: 0 }]);

  const isBulk = type === PromotionType.Bulk;
  const isBundle = type === PromotionType.Bundle;

  const updateTier = (index: number, field: keyof TierInput, value: string) => {
    const numValue = parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
    setTiers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: numValue };
      return updated;
    });
  };

  const handleSubmit = () => {
    if (!name || !selectedProductId || tiers[0].price <= 0) return;
    if (isBundle && (!tieUpProductId || tieUpQuantity < 1)) return;

    const payload: CreatePromotionRequest = {
      name,
      type: PromotionType[type] as unknown as string,
      mainProductId: selectedProductId,
      isActive: true,
      tiers: (isBulk ? tiers : [{ quantity: 1, price: tiers[0].price }]).map(
        (t) => ({
          quantity: t.quantity,
          price: t.price,
        }),
      ),
      tieUpProductId: isBundle ? tieUpProductId : null,
      tieUpQuantity: isBundle ? tieUpQuantity : null,
    };

    addPromotion(payload, {
      onSuccess: () => {
        setName("");
        setSelectedProductId("");
        setProductSearch("");
        setTieUpProductId(null);
        setTieUpSearch("");
        setTieUpQuantity(1);
        setTiers([{ quantity: 1, price: 0 }]);
        onClose();
      },
    });
  };

  const filteredMainProducts = useMemo(
    () =>
      products
        ?.filter((p) =>
          p.name.toLowerCase().includes(productSearch.toLowerCase()),
        )
        .slice(0, 3),
    [products, productSearch],
  );

  const filteredTieUpProducts = useMemo(
    () =>
      products
        ?.filter((p) =>
          p.name.toLowerCase().includes(tieUpSearch.toLowerCase()),
        )
        .slice(0, 3),
    [products, tieUpSearch],
  );

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-end bg-slate-900/40"
      >
        <View className="bg-white rounded-t-[32px] h-[90%] shadow-2xl">
          {/* Compact Header */}
          <View className="px-6 pt-6 pb-2 flex-row justify-between items-center">
            <View>
              <Text className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                Configure Deal
              </Text>
              <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Strategy Builder
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 bg-slate-100 rounded-full items-center justify-center"
            >
              <X size={18} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1 px-6"
            keyboardShouldPersistTaps="handled"
          >
            {/* Slim Strategy Switcher */}
            <View className="flex-row gap-2 my-4">
              {STRATEGIES.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => {
                    setType(s.id);
                    setTiers([{ quantity: 1, price: 0 }]);
                  }}
                  className={cn(
                    "flex-1 flex-row items-center justify-center py-2.5 rounded-xl border",
                    type === s.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-100 bg-white",
                  )}
                >
                  <s.icon
                    size={14}
                    color={type === s.id ? "#2563eb" : "#94a3b8"}
                  />
                  <Text
                    className={cn(
                      "ml-1.5 text-[10px] font-black uppercase",
                      type === s.id ? "text-blue-600" : "text-slate-400",
                    )}
                  >
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="gap-y-4">
              {/* Title - Slimmer Input */}
              <View>
                <Text className="text-[9px] font-black text-slate-400 uppercase mb-1.5 ml-1">
                  Title
                </Text>
                <TextInput
                  placeholder="e.g. Promo Name"
                  className="bg-slate-50/50 p-3 rounded-xl font-bold text-slate-900 border border-slate-100"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* Main Product Selection */}
              <View>
                <Text className="text-[9px] font-black text-slate-400 uppercase mb-1.5 ml-1">
                  {isBundle ? "Item to Discount" : "Target Product"}
                </Text>
                <View className="bg-slate-50/50 flex-row items-center px-3 rounded-xl border border-slate-100">
                  <Search size={14} color="#94a3b8" />
                  <TextInput
                    placeholder="Search product..."
                    className="flex-1 p-2.5 font-bold text-slate-900 text-sm"
                    value={productSearch}
                    onChangeText={(val) => {
                      setProductSearch(val);
                      if (selectedProductId) setSelectedProductId("");
                    }}
                  />
                </View>
                {!selectedProductId && productSearch.length > 0 && (
                  <View className="mt-1 bg-white border border-slate-100 rounded-xl shadow-lg z-10">
                    {filteredMainProducts?.map((p) => (
                      <TouchableOpacity
                        key={p.id}
                        onPress={() => {
                          setSelectedProductId(p.id);
                          setProductSearch(p.name);
                        }}
                        className="p-3 border-b border-slate-50"
                      >
                        <Text className="font-bold text-slate-700 text-xs">
                          {p.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Redesigned Bundle Pairing - Compact & Linked */}
              {isBundle && (
                <View className="flex-column items-center">
                  <View className="flex-row items-center w-full">
                    <View className="w-6 items-center">
                      <LinkIcon size={14} color="#3b82f6" />
                    </View>
                    <View className="flex-1 bg-blue-50/30 p-3 rounded-xl border border-blue-100 flex-row items-center gap-x-2">
                      <TextInput
                        placeholder="Required pairing item..."
                        className="flex-1 font-bold text-slate-900 text-xs"
                        value={tieUpSearch}
                        onChangeText={(val) => {
                          setTieUpSearch(val);
                          if (tieUpProductId) setTieUpProductId(null);
                        }}
                      />
                      <View className="w-10 border-l border-blue-100 pl-2">
                        <TextInput
                          placeholder="Qty"
                          keyboardType="numeric"
                          className="font-black text-center text-blue-600 text-xs"
                          value={tieUpQuantity.toString()}
                          onChangeText={(val) =>
                            setTieUpQuantity(
                              Number(val.replace(/[^0-9]/g, "")) || 1,
                            )
                          }
                        />
                      </View>
                    </View>
                  </View>
                  {!tieUpProductId && tieUpSearch.length > 0 && (
                    <View className="w-full mt-1 bg-white border border-blue-100 rounded-xl shadow-md">
                      {filteredTieUpProducts?.map((p) => (
                        <TouchableOpacity
                          key={p.id}
                          onPress={() => {
                            setTieUpProductId(p.id);
                            setTieUpSearch(p.name);
                          }}
                          className="p-3 border-b border-slate-50"
                        >
                          <Text className="font-bold text-slate-700 text-xs">
                            {p.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Pricing Section - Compact */}
              <View className="mt-2 pb-6">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Pricing
                  </Text>
                  {isBulk && (
                    <TouchableOpacity
                      onPress={() =>
                        setTiers([...tiers, { quantity: 1, price: 0 }])
                      }
                      className="flex-row items-center"
                    >
                      <Plus size={12} color="#2563eb" />
                      <Text className="text-blue-600 font-black text-[9px] ml-1 uppercase">
                        Add Tier
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {tiers.map((tier, index) => (
                  <View
                    key={index}
                    className="flex-row items-center gap-2 mb-2"
                  >
                    {isBulk ? (
                      <View className="flex-1 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                        <Text className="text-[7px] font-black text-slate-400 uppercase mb-0.5 text-center">
                          Min Qty
                        </Text>
                        <TextInput
                          keyboardType="numeric"
                          value={tier.quantity.toString()}
                          className="font-black text-slate-900 text-center text-xs"
                          onChangeText={(val) =>
                            updateTier(index, "quantity", val)
                          }
                        />
                      </View>
                    ) : (
                      <View className="w-8 items-center">
                        <ArrowRight size={16} color="#cbd5e1" />
                      </View>
                    )}

                    <View className="flex-[2] bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                      <Text className="text-[7px] font-black text-slate-400 uppercase mb-0.5">
                        {isBundle ? "Promo Unit Price" : "Unit Price"} (₱)
                      </Text>
                      <TextInput
                        placeholder="0.00"
                        keyboardType="numeric"
                        value={tier.price === 0 ? "" : tier.price.toString()}
                        className="font-black text-slate-900 text-sm"
                        onChangeText={(val) => updateTier(index, "price", val)}
                      />
                    </View>

                    {isBulk && tiers.length > 1 && (
                      <TouchableOpacity
                        onPress={() =>
                          setTiers(tiers.filter((_, i) => i !== index))
                        }
                        className="p-1"
                      >
                        <Trash2 size={16} color="#e11d48" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer - Professional & Slim */}
          <View className="p-5 border-t border-slate-50 bg-white">
            <TouchableOpacity
              disabled={isProcessing}
              onPress={handleSubmit}
              className={cn(
                "h-14 rounded-2xl flex-row justify-center items-center shadow-lg",
                isProcessing ? "bg-slate-200" : "bg-slate-900 shadow-slate-300",
              )}
            >
              {isProcessing ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Check size={18} color="white" />
                  <Text className="text-white font-black text-sm ml-2 uppercase tracking-widest">
                    Save Promotion
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
