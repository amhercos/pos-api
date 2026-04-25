import { Check, Layers, Package, Search, Tag, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Product } from "../../src/types/inventory";
import {
  CreatePromotionRequest,
  PromotionType,
} from "../../src/types/promotion";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSave: (command: CreatePromotionRequest) => Promise<boolean>;
  products: Product[];
}

interface ToggleItemProps {
  label: string;
  val: PromotionType;
  icon: React.ElementType;
}

export function AddPromotionsModal({
  isVisible,
  onClose,
  onSave,
  products,
}: Props) {
  const [name, setName] = useState<string>("");
  const [type, setType] = useState<PromotionType>(PromotionType.Bulk);

  const [mainProduct, setMainProduct] = useState<Product | null>(null);
  const [tieUpProduct, setTieUpProduct] = useState<Product | null>(null);
  const [showProductPicker, setShowProductPicker] = useState<
    "main" | "tieup" | null
  >(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [promoPrice, setPromoPrice] = useState<string>("");
  const [promoQuantity, setPromoQuantity] = useState<string>("");
  const [tieUpQuantity, setTieUpQuantity] = useState<string>("1");

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSave = async () => {
    if (!name || !mainProduct || !promoPrice) {
      Alert.alert(
        "Required Fields",
        "Please name the promo, select a product, and set a price.",
      );
      return;
    }

    // Strict mapping of local state to the API Request type
    const command: CreatePromotionRequest = {
      name,
      type,
      mainProductId: mainProduct.id,
      promoPrice: parseFloat(promoPrice),
      // Only include these if the type demands it
      promoQuantity:
        type === PromotionType.Bulk ? parseInt(promoQuantity) || 1 : 1,
      tieUpProductId:
        type === PromotionType.Bundle ? tieUpProduct?.id : undefined,
      tieUpQuantity:
        type === PromotionType.Bundle
          ? parseInt(tieUpQuantity) || 1
          : undefined,
    };

    const success = await onSave(command);
    if (success) resetAndClose();
  };

  const resetAndClose = () => {
    setName("");
    setMainProduct(null);
    setTieUpProduct(null);
    setPromoPrice("");
    setPromoQuantity("");
    setTieUpQuantity("1");
    onClose();
  };

  const TypeToggle = ({ label, val, icon: Icon }: ToggleItemProps) => {
    const isActive = type === val;
    return (
      <TouchableOpacity
        onPress={() => setType(val)}
        className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${
          isActive ? "bg-white shadow-sm" : "bg-transparent"
        }`}
      >
        <Icon size={14} color={isActive ? "#2563eb" : "#94a3b8"} />
        <Text
          className={`ml-2 text-[10px] font-bold uppercase ${
            isActive ? "text-blue-600" : "text-slate-400"
          }`}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-slate-900/60 justify-end"
      >
        <View className="bg-white rounded-t-[40px] h-[92%] p-8">
          <View className="flex-row justify-between items-center mb-8">
            <View>
              <Text className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                Promotion Engine
              </Text>
              <Text className="text-2xl font-bold text-slate-900">
                New Promotion
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
            <View className="flex-row mb-8 bg-slate-100 p-1.5 rounded-2xl">
              <TypeToggle label="Bulk" val={PromotionType.Bulk} icon={Layers} />
              <TypeToggle
                label="Bundle"
                val={PromotionType.Bundle}
                icon={Package}
              />
              <TypeToggle
                label="Discount"
                val={PromotionType.Discount}
                icon={Tag}
              />
            </View>

            <View className="gap-6">
              <View>
                <Text className="text-[10px] font-bold uppercase text-slate-400 mb-2 ml-1">
                  Internal Name
                </Text>
                <TextInput
                  className="bg-slate-50 p-4 rounded-2xl font-bold text-slate-900"
                  placeholder="e.g. Buy 2 Get 1 Free"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View>
                <Text className="text-[10px] font-bold uppercase text-slate-400 mb-2 ml-1">
                  Primary Product
                </Text>
                <TouchableOpacity
                  onPress={() => setShowProductPicker("main")}
                  className="bg-slate-50 p-5 rounded-2xl flex-row justify-between items-center"
                >
                  <Text
                    className={`font-bold ${mainProduct ? "text-slate-900" : "text-slate-300"}`}
                  >
                    {mainProduct ? mainProduct.name : "Select a product..."}
                  </Text>
                  <Search
                    size={18}
                    color={mainProduct ? "#0f172a" : "#cbd5e1"}
                  />
                </TouchableOpacity>
              </View>

              <View className="flex-row gap-4">
                {type === PromotionType.Bulk && (
                  <View className="flex-1">
                    <Text className="text-[10px] font-bold uppercase text-slate-400 mb-2 ml-1">
                      Qty Needed
                    </Text>
                    <TextInput
                      className="bg-slate-50 p-4 rounded-2xl font-bold text-slate-900"
                      keyboardType="numeric"
                      value={promoQuantity}
                      onChangeText={setPromoQuantity}
                      placeholder="0"
                    />
                  </View>
                )}

                <View className="flex-1">
                  <Text className="text-[10px] font-bold uppercase text-slate-400 mb-2 ml-1">
                    {type === PromotionType.Bulk ? "Bulk Price" : "Promo Price"}
                  </Text>
                  <TextInput
                    className="bg-slate-50 p-4 rounded-2xl font-bold text-blue-600"
                    keyboardType="numeric"
                    value={promoPrice}
                    onChangeText={setPromoPrice}
                    placeholder="₱ 0.00"
                  />
                </View>
              </View>

              {type === PromotionType.Bundle && (
                <View className="bg-blue-50/50 p-6 rounded-[32px] border border-blue-100">
                  <Text className="text-[10px] font-bold uppercase text-blue-500 mb-4 tracking-widest">
                    Bundle Configuration
                  </Text>

                  <Text className="text-[10px] font-bold uppercase text-slate-400 mb-2 ml-1">
                    Tie-up Product
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowProductPicker("tieup")}
                    className="bg-white p-5 rounded-2xl flex-row justify-between items-center shadow-sm mb-4"
                  >
                    <Text
                      className={`font-bold ${tieUpProduct ? "text-slate-900" : "text-slate-300"}`}
                    >
                      {tieUpProduct
                        ? tieUpProduct.name
                        : "Select second product..."}
                    </Text>
                    <Package
                      size={18}
                      color={tieUpProduct ? "#2563eb" : "#cbd5e1"}
                    />
                  </TouchableOpacity>

                  <Text className="text-[10px] font-bold uppercase text-slate-400 mb-2 ml-1">
                    Tie-up Quantity
                  </Text>
                  <TextInput
                    className="bg-white p-4 rounded-2xl font-bold text-slate-900 shadow-sm"
                    keyboardType="numeric"
                    value={tieUpQuantity}
                    onChangeText={setTieUpQuantity}
                  />
                </View>
              )}
            </View>
          </ScrollView>

          <TouchableOpacity
            onPress={handleSave}
            className="bg-slate-900 h-16 rounded-2xl flex-row items-center justify-center mt-6"
          >
            <Text className="text-white font-bold uppercase text-xs tracking-widest">
              Confirm Promotion
            </Text>
          </TouchableOpacity>
        </View>

        <Modal visible={!!showProductPicker} animationType="fade" transparent>
          <View className="flex-1 bg-slate-900/40 p-6 justify-center">
            <View className="bg-white rounded-[40px] h-[70%] p-6 shadow-2xl">
              <View className="flex-row items-center bg-slate-100 px-4 rounded-2xl mb-4">
                <Search size={16} color="#94a3b8" />
                <TextInput
                  placeholder="Search products..."
                  className="flex-1 p-4 font-bold text-slate-900"
                  onChangeText={setSearchQuery}
                  value={searchQuery}
                />
              </View>
              <ScrollView>
                {filteredProducts.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => {
                      if (showProductPicker === "main") setMainProduct(p);
                      else setTieUpProduct(p);
                      setShowProductPicker(null);
                      setSearchQuery("");
                    }}
                    className="py-4 border-b border-slate-50 flex-row justify-between items-center"
                  >
                    <View>
                      <Text className="font-bold text-slate-800">{p.name}</Text>
                      <Text className="text-slate-400 text-[10px]">
                        Stock: {p.stockQuantity} | ₱{p.price}
                      </Text>
                    </View>
                    {(mainProduct?.id === p.id ||
                      tieUpProduct?.id === p.id) && (
                      <Check size={16} color="#2563eb" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                onPress={() => setShowProductPicker(null)}
                className="mt-4 py-2"
              >
                <Text className="text-center text-slate-400 font-bold uppercase text-[10px]">
                  Close Picker
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </Modal>
  );
}
