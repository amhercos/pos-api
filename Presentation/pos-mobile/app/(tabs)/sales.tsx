import { Filter, Search } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Custom Hooks
import { useCredits } from "@/src/hooks/use-credits";
import { useInventory } from "@/src/hooks/use-inventory";
import { useSale } from "@/src/hooks/use-sale";
import { formatPHP } from "@/src/lib/math";
import { cn } from "@/src/lib/utils";

// Types
import { PaymentType, type Product as SaleProduct } from "@/src/types/sale";

// Components
import { TransactionContent } from "@/components/sales/TransactionContent";
import { TransactionModal } from "@/components/sales/TransactionModal";

export default function NewSalePage() {
  const { width, height } = useWindowDimensions();
  const isTablet = useMemo(
    () => width >= 768 || (width > height && width > 600),
    [width, height],
  );

  const { products = [], refresh } = useInventory();
  const { credits } = useCredits();

  const {
    basket,
    totals,
    addToBasket,
    removeItem,
    updateQuantity,
    clearBasket,
    checkout,
    isSubmitting,
  } = useSale();

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Transaction UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePayment, setActivePayment] = useState<PaymentType>(
    PaymentType.Cash,
  );
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [selectedCreditId, setSelectedCreditId] = useState("");
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerContact, setNewCustomerContact] = useState("");
  const [showVoidConfirm, setShowVoidConfirm] = useState(false);

  // FIX: Mapped correctly to the new useSale calculation engine structure
  const currentTotal =
    activePayment === PaymentType.Credit
      ? totals.creditTotal
      : totals.cashTotal;

  const handleCheckout = async () => {
    const success = await checkout({
      paymentType: activePayment,
      cashReceived: activePayment === PaymentType.Cash ? cashReceived : 0,
      customerCreditId:
        activePayment === PaymentType.Credit && !isNewCustomer
          ? selectedCreditId
          : undefined,
      newCustomerName: isNewCustomer ? newCustomerName : undefined,
      newCustomerContact: isNewCustomer ? newCustomerContact : undefined,
    });

    if (success) {
      setIsModalOpen(false);
      setCashReceived(0);
      setSelectedCreditId("");
      setIsNewCustomer(false);
      setNewCustomerName("");
      setNewCustomerContact("");
    }
  };

  // Grid Layout Rules
  const numColumns = useMemo(() => {
    if (!isTablet) return 2;
    return width > 1100 ? 4 : 3;
  }, [width, isTablet]);

  const sidebarWidth = useMemo(() => {
    if (!isTablet) return 0;
    return Math.min(Math.max(width * 0.35, 340), 450);
  }, [width, isTablet]);

  const columnWidth = useMemo(() => {
    const availableWidth = width - sidebarWidth - (isTablet ? 60 : 48);
    return availableWidth / numColumns;
  }, [width, sidebarWidth, numColumns, isTablet]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCat =
        selectedCategory === "All" ||
        (p.categoryName || "Uncategorized") === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [products, search, selectedCategory]);

  const categories = useMemo(() => {
    const uniqueCats = Array.from(
      new Set(products.map((p) => p.categoryName || "Uncategorized")),
    );
    return ["All", ...uniqueCats.sort()].filter((cat) =>
      cat.toLowerCase().includes(categorySearch.toLowerCase()),
    );
  }, [products, categorySearch]);

  const sharedProps = {
    basket,
    totals,
    activePayment,
    setActivePayment,
    cashReceived,
    setCashReceived,
    isSubmitting,
    handleCheckout,
    updateQuantity,
    removeItem,
    clearBasket,
    credits: credits || [],
    selectedCreditId,
    setSelectedCreditId,
    isNewCustomer,
    setIsNewCustomer,
    newCustomerName,
    setNewCustomerName,
    newCustomerContact,
    setNewCustomerContact,
    showVoidConfirm,
    setShowVoidConfirm,
    onClose: () => setIsModalOpen(false),
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-1 flex-row">
        <View className="flex-1">
          {/* Header & Search */}
          <View className="px-5 py-4 border-b border-slate-50">
            <View className="flex-row items-center gap-2 mb-4">
              <View className="flex-1 flex-row items-center bg-slate-100 rounded-2xl px-4 h-12">
                <Search size={18} color="#94a3b8" />
                <TextInput
                  placeholder="Search items..."
                  value={search}
                  onChangeText={setSearch}
                  className="flex-1 ml-2 text-slate-900 font-bold"
                />
              </View>
              <View className="w-28 flex-row items-center bg-slate-50 rounded-2xl px-3 h-12 border border-slate-100">
                <Filter size={14} color="#cbd5e1" />
                <TextInput
                  placeholder="Filter..."
                  value={categorySearch}
                  onChangeText={setCategorySearch}
                  className="flex-1 ml-1 text-[10px] font-bold"
                />
              </View>
            </View>

            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={categories}
              keyExtractor={(item) => `cat-${item}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setSelectedCategory(item)}
                  className={cn(
                    "px-5 py-2 rounded-full mr-2 h-9 justify-center",
                    selectedCategory === item ? "bg-slate-900" : "bg-slate-50",
                  )}
                >
                  <Text
                    className={cn(
                      "text-[10px] font-black uppercase",
                      selectedCategory === item
                        ? "text-white"
                        : "text-slate-400",
                    )}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Product Grid Area */}
          <FlatList
            data={filteredProducts}
            key={`${numColumns}-grid`}
            numColumns={numColumns}
            columnWrapperStyle={{ gap: 16, paddingHorizontal: 20 }}
            contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
            renderItem={({ item: p }) => (
              <TouchableOpacity
                disabled={p.stockQuantity <= 0}
                onPress={() =>
                  addToBasket({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    stock: p.stockQuantity,
                    promotions: p.promotions, // Feeds promotion schema data safely into useSale calculation loops
                  } as SaleProduct)
                }
                style={{ width: columnWidth }}
                className={cn(
                  "p-4 bg-white border border-slate-100 rounded-3xl mb-4 shadow-sm",
                  p.stockQuantity <= 0 && "opacity-40",
                )}
              >
                <View className="flex-row items-center gap-1.5 mb-2">
                  <View
                    className={cn(
                      "w-2 h-2 rounded-full",
                      p.stockQuantity <= p.lowStockThreshold
                        ? "bg-rose-500"
                        : "bg-emerald-500",
                    )}
                  />
                  <Text className="text-[10px] font-black text-slate-400 uppercase">
                    {p.stockQuantity} Left
                  </Text>
                </View>
                <Text
                  numberOfLines={2}
                  className="font-bold text-slate-800 text-[11px] uppercase h-8 leading-tight"
                >
                  {p.name}
                </Text>
                <View className="mt-3 bg-slate-50 rounded-xl py-2 px-3">
                  <Text className="font-black text-slate-900 text-center">
                    {formatPHP(p.price)}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            refreshControl={
              <RefreshControl refreshing={false} onRefresh={refresh} />
            }
          />

          {/* Mobile Bottom Bar trigger layout overlay */}
          {!isTablet && basket.length > 0 && (
            <View className="absolute bottom-8 left-5 right-5">
              <TouchableOpacity
                onPress={() => setIsModalOpen(true)}
                className="bg-slate-900 h-16 rounded-3xl flex-row items-center justify-between px-6 shadow-xl"
              >
                <Text className="text-white font-black text-xs uppercase">
                  {basket.length} {basket.length === 1 ? "Item" : "Items"}
                </Text>
                <View
                  className={cn(
                    "px-4 py-2 rounded-2xl",
                    activePayment === PaymentType.Credit
                      ? "bg-slate-700"
                      : "bg-emerald-500",
                  )}
                >
                  <Text className="text-white font-black text-sm">
                    {formatPHP(currentTotal)}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Tablet split workspace layout */}
        {isTablet && (
          <View
            style={{ width: sidebarWidth }}
            className="border-l border-slate-100 bg-slate-50"
          >
            <TransactionContent {...sharedProps} isTablet={true} />
          </View>
        )}
      </View>

      {!isTablet && <TransactionModal {...sharedProps} isOpen={isModalOpen} />}
    </SafeAreaView>
  );
}
