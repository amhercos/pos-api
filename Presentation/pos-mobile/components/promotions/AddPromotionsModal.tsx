import { Check, Search, X } from "lucide-react-native";
import React, { useState } from "react";
import {
    Alert,
    Modal,
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

export function AddPromotionsModal({
  isVisible,
  onClose,
  onSave,
  products,
}: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState<PromotionType>(PromotionType.Bulk);

  // Selection States
  const [mainProduct, setMainProduct] = useState<Product | null>(null);
  const [tieUpProduct, setTieUpProduct] = useState<Product | null>(null);
  const [showProductPicker, setShowProductPicker] = useState<
    "main" | "tieup" | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Input States
  const [promoPrice, setPromoPrice] = useState("");
  const [promoQuantity, setPromoQuantity] = useState("");
  const [tieUpQuantity, setTieUpQuantity] = useState("");

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSave = async () => {
    if (!name || !mainProduct) {
      Alert.alert(
        "Missing Info",
        "Please provide a name and select a product.",
      );
      return;
    }

    const command: CreatePromotionRequest = {
      name,
      type,
      mainProductId: mainProduct.id,
      promoPrice: promoPrice ? parseFloat(promoPrice) : undefined,
      promoQuantity: promoQuantity ? parseInt(promoQuantity) : undefined,
      tieUpProductId: tieUpProduct?.id,
      tieUpQuantity: tieUpQuantity ? parseInt(tieUpQuantity) : undefined,
    };

    const success = await onSave(command);
    if (success) {
      resetAndClose();
    }
  };

  const resetAndClose = () => {
    setName("");
    setMainProduct(null);
    setTieUpProduct(null);
    setPromoPrice("");
    setPromoQuantity("");
    setTieUpQuantity("");
    onClose();
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl h-[92%] p-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-900">
              Configure Promo
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X color="#6b7280" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Promo Name */}
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Internal Name
            </Text>
            <TextInput
              className="bg-gray-100 p-4 rounded-xl mb-4 text-gray-900"
              placeholder="e.g. Buy 3 Coke for 100"
              value={name}
              onChangeText={setName}
            />

            {/* Type Toggle */}
            <View className="flex-row mb-6 bg-gray-100 p-1 rounded-xl">
              {[
                { label: "Bulk", val: PromotionType.Bulk },
                { label: "Bundle", val: PromotionType.Bundle },
                { label: "Discount", val: PromotionType.Discount },
              ].map((t) => (
                <TouchableOpacity
                  key={t.val}
                  onPress={() => setType(t.val)}
                  className={`flex-1 py-2 rounded-lg ${type === t.val ? "bg-white shadow-sm" : ""}`}
                >
                  <Text
                    className={`text-center font-bold ${type === t.val ? "text-blue-600" : "text-gray-500"}`}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Product Selectors */}
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Main Product
            </Text>
            <TouchableOpacity
              onPress={() => setShowProductPicker("main")}
              className="bg-gray-100 p-4 rounded-xl mb-4 flex-row justify-between items-center"
            >
              <Text className={mainProduct ? "text-gray-900" : "text-gray-400"}>
                {mainProduct ? mainProduct.name : "Tap to select product..."}
              </Text>
              <Search size={18} color="#9ca3af" />
            </TouchableOpacity>

            {/* Logic Fields */}
            {type === PromotionType.Bulk && (
              <View className="flex-row gap-4 mb-4">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Qty needed
                  </Text>
                  <TextInput
                    className="bg-gray-100 p-4 rounded-xl"
                    keyboardType="numeric"
                    value={promoQuantity}
                    onChangeText={setPromoQuantity}
                    placeholder="e.g. 3"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Total Price
                  </Text>
                  <TextInput
                    className="bg-gray-100 p-4 rounded-xl"
                    keyboardType="numeric"
                    value={promoPrice}
                    onChangeText={setPromoPrice}
                    placeholder="₱"
                  />
                </View>
              </View>
            )}

            {type === PromotionType.Bundle && (
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Tie-up Product
                </Text>
                <TouchableOpacity
                  onPress={() => setShowProductPicker("tieup")}
                  className="bg-gray-100 p-4 rounded-xl mb-4 flex-row justify-between items-center"
                >
                  <Text
                    className={tieUpProduct ? "text-gray-900" : "text-gray-400"}
                  >
                    {tieUpProduct
                      ? tieUpProduct.name
                      : "Tap to select tie-up..."}
                  </Text>
                  <Search size={18} color="#9ca3af" />
                </TouchableOpacity>
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Bundle Price
                </Text>
                <TextInput
                  className="bg-gray-100 p-4 rounded-xl"
                  keyboardType="numeric"
                  value={promoPrice}
                  onChangeText={setPromoPrice}
                  placeholder="₱"
                />
              </View>
            )}

            {type === PromotionType.Discount && (
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Static Price
                </Text>
                <TextInput
                  className="bg-gray-100 p-4 rounded-xl"
                  keyboardType="numeric"
                  value={promoPrice}
                  onChangeText={setPromoPrice}
                  placeholder="₱"
                />
              </View>
            )}

            <TouchableOpacity
              onPress={handleSave}
              className="bg-blue-600 p-4 rounded-2xl mt-4 shadow-lg shadow-blue-200"
            >
              <Text className="text-white text-center font-bold text-lg">
                Create Promotion
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {/* Internal Product Picker Modal */}
      <Modal visible={!!showProductPicker} animationType="fade" transparent>
        <View className="flex-1 bg-black/40 p-6 justify-center">
          <View className="bg-white rounded-3xl h-[70%] p-4">
            <TextInput
              placeholder="Search products..."
              className="bg-gray-100 p-3 rounded-xl mb-4"
              onChangeText={setSearchQuery}
            />
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
                  className="p-4 border-b border-gray-50 flex-row justify-between items-center"
                >
                  <View>
                    <Text className="font-bold text-gray-800">{p.name}</Text>
                    <Text className="text-gray-500 text-xs">
                      Current Price: ₱{p.price}
                    </Text>
                  </View>
                  {(mainProduct?.id === p.id || tieUpProduct?.id === p.id) && (
                    <Check size={16} color="#2563eb" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowProductPicker(null)}
              className="mt-4 p-3"
            >
              <Text className="text-center text-red-500 font-bold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}
