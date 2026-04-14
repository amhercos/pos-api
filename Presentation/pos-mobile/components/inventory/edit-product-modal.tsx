import { cn } from "@/src/lib/utils";
import type {
    Category,
    Product,
    UpdateProductRequest,
} from "@/src/types/inventory";
import { Calendar, Check, PencilLine, Search, X } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
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
import DateTimePickerModal from "react-native-modal-datetime-picker";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  categories: Category[];
  onUpdate: (id: string, data: UpdateProductRequest) => Promise<void>;
  onOpenCategoryManager: () => void;
}

export function EditProductModal({
  isOpen,
  onClose,
  product,
  categories,
  onUpdate,
  onOpenCategoryManager,
}: EditProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stockQuantity: "",
    categoryId: "",
    description: "",
    expiryDate: "",
  });

  // Pre-fill form when product changes
  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name,
        price: product.price.toString(),
        stockQuantity: product.stockQuantity.toString(),
        categoryId: product.categoryId || "",
        description: product.description || "",
        expiryDate: product.expiryDate ? product.expiryDate.split("T")[0] : "",
      });
      setSearchQuery(product.categoryName || "");
    }
  }, [product, isOpen]);

  const filteredCategories = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return query
      ? categories.filter((c) => c.name.toLowerCase().includes(query))
      : categories.slice(0, 5);
  }, [categories, searchQuery]);

  const isValid = useMemo(
    () =>
      formData.name.trim().length >= 2 &&
      formData.price !== "" &&
      formData.stockQuantity !== "",
    [formData],
  );

  const handleConfirmDate = (date: Date) => {
    const formattedDate = date.toISOString().split("T")[0];
    setFormData({ ...formData, expiryDate: formattedDate });
    setDatePickerVisibility(false);
  };

  const handleSubmit = async () => {
    if (!isValid || !product) return;
    setLoading(true);
    try {
      await onUpdate(product.id, {
        id: product.id,
        name: formData.name,
        price: Number(formData.price),
        stock: Number(formData.stockQuantity),
        lowStockThreshold: product.lowStockThreshold || 5,
        categoryId: formData.categoryId || null,
        description: formData.description,
        expiryDate: formData.expiryDate || null,
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const labelClass =
    "text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 mb-1.5";
  const inputClass =
    "bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900";

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-end bg-black/50"
      >
        <View className="bg-white rounded-t-[32px] max-h-[90%] shadow-2xl">
          {/* Header */}
          <View className="px-6 pt-7 pb-4 flex-row items-center justify-between border-b border-slate-50">
            <View className="flex-row items-center gap-4">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg">
                <PencilLine size={20} color="white" />
              </View>
              <View>
                <Text className="text-lg font-black text-slate-900 tracking-tight">
                  Edit Product
                </Text>
                <Text className="text-[12px] font-medium text-slate-400">
                  Update item details
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="p-2 bg-slate-100 rounded-full"
            >
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="px-6 py-4"
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-y-5 pb-10">
              {/* Name */}
              <View>
                <Text className={labelClass}>Product Name</Text>
                <TextInput
                  className={inputClass}
                  value={formData.name}
                  onChangeText={(val) =>
                    setFormData({ ...formData, name: val })
                  }
                />
              </View>

              {/* Price & Stock */}
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className={labelClass}>Price (₱)</Text>
                  <TextInput
                    keyboardType="numeric"
                    className={inputClass}
                    value={formData.price}
                    onChangeText={(val) =>
                      setFormData({ ...formData, price: val })
                    }
                  />
                </View>
                <View className="flex-1">
                  <Text className={labelClass}>In Stock</Text>
                  <TextInput
                    keyboardType="numeric"
                    className={inputClass}
                    value={formData.stockQuantity}
                    onChangeText={(val) =>
                      setFormData({ ...formData, stockQuantity: val })
                    }
                  />
                </View>
              </View>

              {/* Category & Expiry Row */}
              <View className="flex-row gap-4 z-50">
                <View className="flex-[1.5] relative">
                  <View className="flex-row justify-between items-center pr-1">
                    <Text className={labelClass}>Category</Text>
                    <TouchableOpacity onPress={onOpenCategoryManager}>
                      <Text className="text-[9px] font-bold text-blue-600 uppercase">
                        Manage
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View className="relative">
                    <View className="absolute left-3 top-3.5 z-10">
                      <Search size={14} color="#94a3b8" />
                    </View>
                    <TextInput
                      placeholder="Select..."
                      className={cn(inputClass, "pl-9")}
                      value={searchQuery}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                      onChangeText={(val) => {
                        setSearchQuery(val);
                        if (!val) setFormData({ ...formData, categoryId: "" });
                      }}
                    />
                  </View>
                  {isFocused && filteredCategories.length > 0 && (
                    <View className="absolute top-[75px] left-0 right-0 bg-white border border-slate-100 shadow-xl rounded-2xl p-1 z-[100] max-h-40">
                      {filteredCategories.map((c) => (
                        <TouchableOpacity
                          key={c.id}
                          onPress={() => {
                            setFormData({ ...formData, categoryId: c.id });
                            setSearchQuery(c.name);
                            setIsFocused(false);
                          }}
                          className="flex-row items-center justify-between px-4 py-3 rounded-xl active:bg-slate-50"
                        >
                          <Text className="text-sm font-bold text-slate-600">
                            {c.name}
                          </Text>
                          {formData.categoryId === c.id && (
                            <Check size={14} color="#2563eb" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View className="flex-1">
                  <View className="flex-row justify-between items-center pr-1">
                    <Text className={labelClass}>Expiry</Text>
                    {formData.expiryDate ? (
                      <TouchableOpacity
                        onPress={() =>
                          setFormData({ ...formData, expiryDate: "" })
                        }
                      >
                        <Text className="text-[9px] font-bold text-rose-500 uppercase">
                          Clear
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    onPress={() => setDatePickerVisibility(true)}
                    className={cn(
                      inputClass,
                      "flex-row items-center justify-between",
                    )}
                  >
                    <Text
                      className={cn(
                        "text-xs font-bold",
                        formData.expiryDate
                          ? "text-slate-900"
                          : "text-slate-400",
                      )}
                    >
                      {formData.expiryDate || "YYYY-MM-DD"}
                    </Text>
                    <Calendar size={14} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Description */}
              <View>
                <Text className={labelClass}>Description</Text>
                <TextInput
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  className={cn(inputClass, "h-20 pt-3")}
                  value={formData.description}
                  onChangeText={(val) =>
                    setFormData({ ...formData, description: val })
                  }
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading || !isValid}
                className={cn(
                  "h-14 rounded-2xl items-center justify-center shadow-lg active:scale-[0.98]",
                  isValid ? "bg-blue-600 shadow-blue-100" : "bg-slate-200",
                )}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-black text-base">
                    Save Changes
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirmDate}
            onCancel={() => setDatePickerVisibility(false)}
            accentColor="#2563eb"
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
