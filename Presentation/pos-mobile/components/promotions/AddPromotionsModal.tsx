import { Layers, Package, Search, Tag, Trash2, X } from "lucide-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Product } from "../../src/types/inventory";
import {
  CreatePromotionRequest,
  PromoTier,
  PromotionType,
} from "../../src/types/promotion";

interface AddPromotionsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (command: CreatePromotionRequest) => Promise<boolean>;
  products: Product[];
}

type ProductPickerMode = "main" | "tieup" | null;

interface PromotionFormState {
  name: string;
  type: PromotionType;
  mainProduct: Product | null;
  tieUpProduct: Product | null;
  tiers: PromoTier[];
}

const INITIAL_STATE: PromotionFormState = {
  name: "",
  type: PromotionType.Bulk,
  mainProduct: null,
  tieUpProduct: null,
  tiers: [{ quantity: 1, price: 0 }],
};

export const AddPromotionsModal = React.memo(
  ({
    isVisible,
    onClose,
    onSave,
    products,
  }: AddPromotionsModalProps): React.JSX.Element | null => {
    const [formState, setFormState] =
      useState<PromotionFormState>(INITIAL_STATE);
    const [showProductPicker, setShowProductPicker] =
      useState<ProductPickerMode>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const slideAnim = useRef(new Animated.Value(1000)).current;

    const filteredProducts = useMemo(
      () =>
        products.filter((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      [products, searchQuery],
    );

    useEffect(() => {
      if (isVisible) {
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(slideAnim, {
          toValue: 1000,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    }, [isVisible, slideAnim]);

    const handleReset = useCallback((): void => {
      setFormState(INITIAL_STATE);
      setSearchQuery("");
      setShowProductPicker(null);
      onClose();
    }, [onClose]);

    const handleTypeChange = useCallback((newType: PromotionType): void => {
      Keyboard.dismiss();
      setFormState((prev) => ({
        ...prev,
        type: newType,
      }));
    }, []);

    const handleUpdateTier = useCallback(
      (index: number, field: keyof PromoTier, value: string): void => {
        const cleaned = value.replace(/[^0-9.]/g, "");
        const numValue = cleaned === "" ? 0 : Number(cleaned);

        setFormState((prev) => {
          const updatedTiers = [...prev.tiers];
          updatedTiers[index] = {
            ...updatedTiers[index],
            [field]: numValue,
          };
          return {
            ...prev,
            tiers: updatedTiers,
          };
        });
      },
      [],
    );

    const handleAddTier = useCallback((): void => {
      setFormState((prev) => ({
        ...prev,
        tiers: [...prev.tiers, { quantity: 1, price: 0 }],
      }));
    }, []);

    const handleRemoveTier = useCallback((index: number): void => {
      setFormState((prev) => ({
        ...prev,
        tiers: prev.tiers.filter((_, i) => i !== index),
      }));
    }, []);

    const handleSelectProduct = useCallback(
      (product: Product, mode: ProductPickerMode): void => {
        if (mode === "main") {
          setFormState((prev) => ({
            ...prev,
            mainProduct: product,
          }));
        } else if (mode === "tieup") {
          setFormState((prev) => ({
            ...prev,
            tieUpProduct: product,
          }));
        }
        setShowProductPicker(null);
      },
      [],
    );

    const handleSave = useCallback(async (): Promise<void> => {
      const validTiers = formState.tiers.filter(
        (t) => t.price > 0 && t.quantity > 0,
      );

      if (
        !formState.name ||
        !formState.mainProduct ||
        validTiers.length === 0
      ) {
        Alert.alert("Error", "Please fill in required fields.");
        return;
      }

      const success = await onSave({
        name: formState.name,
        type: formState.type,
        mainProductId: formState.mainProduct.id,
        tiers: validTiers,
        tieUpProductId:
          formState.type === PromotionType.Bundle
            ? formState.tieUpProduct?.id
            : undefined,
      });

      if (success) {
        handleReset();
      }
    }, [formState, onSave, handleReset]);

    if (!isVisible) return null;

    return (
      <Modal
        visible={isVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={handleReset}
      >
        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            flex: 1,
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 justify-end"
          >
            {/* Backdrop */}
            <TouchableOpacity
              activeOpacity={1}
              onPress={handleReset}
              className="absolute inset-0 bg-slate-900/60"
            />

            <View className="bg-white rounded-t-[40px] h-[90%] p-6 shadow-2xl">
              {showProductPicker ? (
                <ProductPickerView
                  filteredProducts={filteredProducts}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onSelectProduct={handleSelectProduct}
                  onClose={() => setShowProductPicker(null)}
                  currentMode={showProductPicker}
                />
              ) : (
                <PromotionFormView
                  formState={formState}
                  onNameChange={(name) =>
                    setFormState((prev) => ({ ...prev, name }))
                  }
                  onTypeChange={handleTypeChange}
                  onSelectMainProduct={() => setShowProductPicker("main")}
                  onSelectTieUpProduct={() => setShowProductPicker("tieup")}
                  onUpdateTier={handleUpdateTier}
                  onAddTier={handleAddTier}
                  onRemoveTier={handleRemoveTier}
                  onSave={handleSave}
                  onClose={handleReset}
                />
              )}
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </Modal>
    );
  },
);

AddPromotionsModal.displayName = "AddPromotionsModal";

interface ProductPickerViewProps {
  filteredProducts: Product[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectProduct: (product: Product, mode: ProductPickerMode) => void;
  onClose: () => void;
  currentMode: ProductPickerMode;
}

const ProductPickerView = React.memo(
  ({
    filteredProducts,
    searchQuery,
    onSearchChange,
    onSelectProduct,
    onClose,
    currentMode,
  }: ProductPickerViewProps): React.JSX.Element => (
    <View className="flex-1">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-xl font-black text-slate-900">
          Select Product
        </Text>
        <TouchableOpacity
          onPress={onClose}
          className="bg-slate-100 p-2 rounded-full"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center bg-slate-100 px-4 rounded-2xl mb-4 border border-slate-200">
        <Search size={16} color="#94a3b8" />
        <TextInput
          className="flex-1 p-3 ml-2 font-medium text-slate-900"
          placeholder="Search..."
          onChangeText={onSearchChange}
          value={searchQuery}
          autoFocus
          placeholderTextColor="#cbd5e1"
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {filteredProducts.map((product) => (
          <TouchableOpacity
            key={product.id}
            className="py-4 border-b border-slate-50 flex-row justify-between items-center"
            onPress={() => onSelectProduct(product, currentMode)}
          >
            <View>
              <Text className="font-bold text-slate-800">{product.name}</Text>
              <Text className="text-slate-400 text-[10px]">
                Stock: {product.stockQuantity}
              </Text>
            </View>
            <Text className="font-black text-blue-600">₱{product.price}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  ),
);

ProductPickerView.displayName = "ProductPickerView";

interface PromotionFormViewProps {
  formState: PromotionFormState;
  onNameChange: (name: string) => void;
  onTypeChange: (type: PromotionType) => void;
  onSelectMainProduct: () => void;
  onSelectTieUpProduct: () => void;
  onUpdateTier: (index: number, field: keyof PromoTier, value: string) => void;
  onAddTier: () => void;
  onRemoveTier: (index: number) => void;
  onSave: () => Promise<void>;
  onClose: () => void;
}

const PromotionFormView = React.memo(
  ({
    formState,
    onNameChange,
    onTypeChange,
    onSelectMainProduct,
    onSelectTieUpProduct,
    onUpdateTier,
    onAddTier,
    onRemoveTier,
    onSave,
    onClose,
  }: PromotionFormViewProps): React.JSX.Element => {
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const handleSavePress = useCallback(async (): Promise<void> => {
      setIsSaving(true);
      try {
        await onSave();
      } finally {
        setIsSaving(false);
      }
    }, [onSave]);

    const promotionTypes: {
      id: PromotionType;
      label: string;
      icon: typeof Layers;
    }[] = [
      { id: PromotionType.Bulk, label: "Bulk", icon: Layers },
      { id: PromotionType.Bundle, label: "Bundle", icon: Package },
      { id: PromotionType.Discount, label: "Fixed", icon: Tag },
    ];

    return (
      <View className="flex-1">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-xl font-black text-slate-900">
            Configure Promo
          </Text>
          <TouchableOpacity
            onPress={onClose}
            className="bg-slate-100 p-2 rounded-full"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {/* Type Toggles - Wrapped in memoized component to isolate from NativeWind processing */}
          <TypeToggleButtons
            formType={formState.type}
            onTypeChange={onTypeChange}
            promotionTypes={promotionTypes}
          />

          {/* Form Fields */}
          <View className="gap-y-5">
            {/* Name Field */}
            <View>
              <Text className="text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">
                Name
              </Text>
              <TextInput
                className="bg-slate-50 p-4 rounded-2xl font-bold border border-slate-100 text-slate-900"
                value={formState.name}
                onChangeText={onNameChange}
                placeholder="Promo Title"
                placeholderTextColor="#cbd5e1"
              />
            </View>

            {/* Primary Product Field */}
            <View>
              <Text className="text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">
                Primary Product
              </Text>
              <TouchableOpacity
                onPress={onSelectMainProduct}
                className="bg-slate-50 p-4 rounded-2xl flex-row justify-between border border-slate-100"
              >
                <Text
                  className={`font-bold ${
                    formState.mainProduct ? "text-slate-900" : "text-slate-300"
                  }`}
                >
                  {formState.mainProduct?.name || "Select..."}
                </Text>
                <Search size={18} color="#cbd5e1" />
              </TouchableOpacity>
            </View>

            {/* Tie-up Product Field (Bundle only) */}
            {formState.type === PromotionType.Bundle && (
              <View>
                <Text className="text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">
                  Tie-up Product
                </Text>
                <TouchableOpacity
                  onPress={onSelectTieUpProduct}
                  className="bg-amber-50 p-4 rounded-2xl flex-row justify-between border border-amber-100"
                >
                  <Text
                    className={`font-bold ${
                      formState.tieUpProduct
                        ? "text-amber-900"
                        : "text-amber-300"
                    }`}
                  >
                    {formState.tieUpProduct?.name || "Select..."}
                  </Text>
                  <Package size={18} color="#fcd34d" />
                </TouchableOpacity>
              </View>
            )}

            {/* Pricing Section */}
            <View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-[10px] font-bold text-slate-400 uppercase">
                  Pricing
                </Text>
                {formState.type === PromotionType.Bulk && (
                  <TouchableOpacity onPress={onAddTier}>
                    <Text className="text-blue-600 font-bold text-[10px]">
                      + ADD TIER
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {formState.tiers.map((tier, index) => (
                <View key={index} className="flex-row gap-x-2 mb-2">
                  {formState.type === PromotionType.Bulk && (
                    <TextInput
                      className="w-20 bg-slate-50 p-4 rounded-xl font-bold text-center text-slate-900"
                      keyboardType="numeric"
                      value={tier.quantity.toString()}
                      onChangeText={(v) => onUpdateTier(index, "quantity", v)}
                      placeholder="Qty"
                      placeholderTextColor="#cbd5e1"
                    />
                  )}
                  <View className="flex-1 flex-row items-center bg-slate-50 rounded-xl px-4 border border-slate-100">
                    <Text className="text-slate-400 font-bold mr-1">₱</Text>
                    <TextInput
                      className="flex-1 py-4 font-bold text-blue-600"
                      keyboardType="numeric"
                      value={tier.price === 0 ? "" : tier.price.toString()}
                      onChangeText={(v) => onUpdateTier(index, "price", v)}
                      placeholder="0.00"
                      placeholderTextColor="#cbd5e1"
                    />
                  </View>
                  {formState.tiers.length > 1 && (
                    <TouchableOpacity
                      onPress={() => onRemoveTier(index)}
                      className="bg-red-50 p-4 rounded-xl"
                    >
                      <Trash2 size={18} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSavePress}
          disabled={isSaving}
          className="bg-slate-900 h-14 rounded-2xl items-center justify-center mt-4"
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold uppercase text-xs tracking-widest">
            {isSaving ? "Saving..." : "Save Promotion"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  },
);

PromotionFormView.displayName = "PromotionFormView";

interface TypeToggleButtonsProps {
  formType: PromotionType;
  onTypeChange: (type: PromotionType) => void;
  promotionTypes: {
    id: PromotionType;
    label: string;
    icon: typeof Layers;
  }[];
}

const TypeToggleButtons = React.memo(
  ({
    formType,
    onTypeChange,
    promotionTypes,
  }: TypeToggleButtonsProps): React.JSX.Element => (
    <View style={styles.typeToggleContainer}>
      {promotionTypes.map((item) => {
        const isSelected = formType === item.id;
        const IconComponent = item.icon;

        return (
          <TouchableOpacity
            key={item.id}
            onPress={() => onTypeChange(item.id)}
            style={[
              styles.typeToggleButton,
              isSelected && styles.typeToggleButtonActive,
            ]}
          >
            <IconComponent
              size={14}
              color={isSelected ? "#2563eb" : "#94a3b8"}
            />
            <Text
              style={[
                styles.typeToggleLabel,
                isSelected && styles.typeToggleLabelActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  ),
);

TypeToggleButtons.displayName = "TypeToggleButtons";

/**
 * StyleSheet for toggle buttons - using pure StyleSheet instead of className
 * prevents NativeWind from re-processing on every state change
 */
const styles = StyleSheet.create({
  typeToggleContainer: {
    flexDirection: "row",
    marginBottom: 24,
    backgroundColor: "#f1f5f9",
    padding: 4,
    borderRadius: 16,
    gap: 4,
  },
  typeToggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
  typeToggleButtonActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  typeToggleLabel: {
    marginLeft: 8,
    fontSize: 10,
    fontWeight: "700",
    color: "#94a3b8",
  },
  typeToggleLabelActive: {
    color: "#2563eb",
  },
});
