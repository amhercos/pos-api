import { cn } from "@/src/lib/utils";
import {
  ArrowRight,
  Check,
  Layers,
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
  const isDiscount = type === PromotionType.Discount;

  const updateTier = (index: number, field: keyof TierInput, value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    const numValue = cleaned === "" ? 0 : parseFloat(cleaned);
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
        className="flex-1 justify-end bg-slate-900/50"
      >
        <View className="bg-white rounded-t-[40px] h-[85%] shadow-2xl">
          {/* HEADER */}
          <View className="px-6 pt-7 pb-2 flex-row justify-between items-center">
            <Text className="text-2xl font-black text-slate-900 tracking-tight">
              New Promotion
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-9 h-9 bg-slate-100 rounded-full items-center justify-center"
            >
              <X size={18} color="#475569" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1 px-6"
            keyboardShouldPersistTaps="handled"
          >
            {/* TYPE SWITCHER */}
            <View className="flex-row gap-2 my-4">
              {STRATEGIES.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => {
                    setType(s.id);
                    setTiers([{ quantity: 1, price: 0 }]);
                  }}
                  className={cn(
                    "flex-1 flex-row items-center justify-center py-3 rounded-xl border",
                    type === s.id
                      ? "border-blue-600 bg-blue-50/60"
                      : "border-slate-100 bg-white",
                  )}
                >
                  <s.icon
                    size={14}
                    color={type === s.id ? "#2563eb" : "#64748b"}
                  />
                  <Text
                    className={cn(
                      "ml-2 text-xs font-bold",
                      type === s.id ? "text-blue-700" : "text-slate-500",
                    )}
                  >
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="gap-y-4 pt-1">
              {/* PROMO TITLE */}
              <View>
                <Text className="text-xs font-bold text-slate-900 mb-1.5 ml-1">
                  Promo Title
                </Text>
                <TextInput
                  placeholder="eg. Year End Promo, etc."
                  className="bg-slate-50 p-4 rounded-xl font-medium text-slate-900 border border-slate-100 text-sm"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* DYNAMIC FORM WORKFLOWS */}
              {isBundle ? (
                <View className="bg-amber-50/40 border border-amber-200/60 p-4 rounded-2xl gap-y-3">
                  {/* CONDITION PRODUCT (TIE-UP) */}
                  <View>
                    <Text className="text-xs font-bold text-amber-900 mb-1.5 ml-1">
                      Primary Producteg.
                    </Text>
                    <View className="bg-white flex-row items-center px-3 rounded-xl border border-amber-200/70">
                      <Search size={14} color="#b45309" />
                      <TextInput
                        placeholder="Search required pairing product..."
                        className="flex-1 p-3.5 font-medium text-slate-900 text-xs"
                        value={tieUpSearch}
                        onChangeText={(val) => {
                          setTieUpSearch(val);
                          if (tieUpProductId) setTieUpProductId(null);
                        }}
                      />
                    </View>

                    {!tieUpProductId && tieUpSearch.length > 0 && (
                      <View className="bg-white border border-amber-100 rounded-xl mt-1 shadow-md z-10">
                        {filteredTieUpProducts?.map((p) => (
                          <TouchableOpacity
                            key={p.id}
                            onPress={() => {
                              setTieUpProductId(p.id);
                              setTieUpSearch(p.name);
                              setTieUpQuantity(1); // Set to 1 explicitly for 1-to-1 backend matching
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

                  {/* CONNECTIVE FLOW ARROW */}
                  <View className="align-center items-center py-0.5">
                    <ArrowRight size={14} color="#d97706" />
                  </View>

                  {/* TARGET PRODUCT (MAIN PRODUCT) */}
                  <View>
                    <Text className="text-xs font-bold text-amber-900 mb-1.5 ml-1">
                      Tie -Up Product
                    </Text>
                    <View className="bg-white flex-row items-center px-3 rounded-xl border border-amber-200/70">
                      <Search size={14} color="#b45309" />
                      <TextInput
                        placeholder="Search product to receive discount..."
                        className="flex-1 p-3.5 font-medium text-slate-900 text-xs"
                        value={productSearch}
                        onChangeText={(val) => {
                          setProductSearch(val);
                          if (selectedProductId) setSelectedProductId("");
                        }}
                      />
                    </View>
                    {!selectedProductId && productSearch.length > 0 && (
                      <View className="bg-white border border-amber-100 rounded-xl mt-1 shadow-md z-10">
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
                </View>
              ) : (
                /* STANDARD SELECT FOR BULK AND DISCOUNT */
                <View>
                  <Text className="text-xs font-bold text-slate-900 mb-1.5 ml-1">
                    Select Product
                  </Text>
                  <View className="bg-slate-50 flex-row items-center px-3 rounded-xl border border-slate-100">
                    <Search size={14} color="#94a3b8" />
                    <TextInput
                      placeholder="Search items..."
                      className="flex-1 p-4 font-medium text-slate-900 text-sm"
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
              )}

              {/* PRICING TABLE AREA */}
              <View className="mt-2 pb-8">
                <View className="flex-row justify-between items-center mb-3 ml-1">
                  <Text className="text-xs font-bold text-slate-900">
                    Pricing Settings
                  </Text>
                  {isBulk && (
                    <TouchableOpacity
                      onPress={() =>
                        setTiers([...tiers, { quantity: 1, price: 0 }])
                      }
                      className="flex-row items-center bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100"
                    >
                      <Plus size={12} color="#2563eb" />
                      <Text className="text-blue-700 font-bold text-xs ml-1">
                        Add Tier
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {tiers.map((tier, index) => (
                  <View
                    key={index}
                    className="flex-row items-end gap-2 mb-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100"
                  >
                    {(isBulk || isDiscount) && (
                      <View className="flex-1">
                        <Text className="text-[9px] font-black text-slate-400 mb-1.5 text-center">
                          QTY
                        </Text>
                        <TextInput
                          keyboardType="number-pad"
                          value={
                            tier.quantity === 0 ? "" : tier.quantity.toString()
                          }
                          className="bg-white p-3 rounded-xl font-black text-center text-slate-900 border border-slate-200/60 text-sm"
                          onChangeText={(val) =>
                            updateTier(index, "quantity", val)
                          }
                        />
                      </View>
                    )}

                    <View className="flex-[2.5]">
                      <Text className="text-[9px] font-black text-slate-400 mb-1.5 ml-1">
                        {isBulk
                          ? "TOTAL PACK PRICE (₱)"
                          : "PROMO PRICE EACH (₱)"}
                      </Text>
                      <TextInput
                        placeholder="0.00"
                        keyboardType="decimal-pad"
                        value={tier.price === 0 ? "" : tier.price.toString()}
                        className="bg-white p-3 rounded-xl font-black text-slate-900 border border-slate-200/60 text-sm"
                        onChangeText={(val) => updateTier(index, "price", val)}
                      />
                    </View>

                    {isBulk && tiers.length > 1 && (
                      <TouchableOpacity
                        onPress={() =>
                          setTiers(tiers.filter((_, i) => i !== index))
                        }
                        className="bg-rose-50 p-3.5 rounded-xl border border-rose-100 items-center justify-center mb-[1px]"
                      >
                        <Trash2 size={16} color="#e11d48" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* GLOBAL MODAL SAVING TRIGGER */}
          <View className="p-5 pb-8 border-t border-slate-100 bg-white">
            <TouchableOpacity
              disabled={isProcessing}
              onPress={handleSubmit}
              activeOpacity={0.8}
              className={cn(
                "h-14 rounded-2xl flex-row justify-center items-center shadow-sm",
                isProcessing ? "bg-slate-300" : "bg-slate-900",
              )}
            >
              {isProcessing ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Check size={16} color="white" />
                  <Text className="text-white font-bold text-sm ml-2 uppercase tracking-wide">
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
