import { Filter, Search, ShoppingCart } from "lucide-react-native";
import { Skeleton } from "moti/skeleton";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  ListRenderItem,
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
import { cn } from "@/src/lib/utils";

// Types
import { type Product as InventoryProduct } from "@/src/types/inventory";
import { PaymentType, type Product as SaleProduct } from "@/src/types/sale";

// Components
import { TransactionModal } from "@/components/sales/TransactionModal";

export default function NewSalePage() {
  const { width } = useWindowDimensions();

  const {
    products = [],
    loading: isLoadingProducts,
    hasMore,
    fetchMore,
    refresh,
  } = useInventory();

  const { credits } = useCredits();
  const {
    basket,
    total, // This is now calculated including promos from useSale
    addToBasket,
    removeFromBasket,
    updateQuantity,
    clearBasket,
    checkout,
    isSubmitting,
  } = useSale();

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal & Transaction State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePayment, setActivePayment] = useState<PaymentType>(
    PaymentType.Cash,
  );
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [selectedCreditId, setSelectedCreditId] = useState("");
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerContact, setNewCustomerContact] = useState("");

  const onRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoadingProducts && fetchMore) {
      fetchMore();
    }
  }, [hasMore, isLoadingProducts, fetchMore]);

  const categories = useMemo(() => {
    const uniqueCats = Array.from(
      new Set(products.map((p) => p.categoryName || "Uncategorized")),
    );
    return ["All", ...uniqueCats.sort()].filter((cat) =>
      cat.toLowerCase().includes(categorySearch.toLowerCase()),
    );
  }, [products, categorySearch]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCat =
        selectedCategory === "All" ||
        (p.categoryName || "Uncategorized") === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [products, search, selectedCategory]);

  const columnWidth = (width - 48) / 2;

  // CLEANED UP CHECKOUT HANDLER
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
      setNewCustomerName("");
      setNewCustomerContact("");
    }
  };

  const renderProduct: ListRenderItem<InventoryProduct> = ({ item: p }) => (
    <TouchableOpacity
      disabled={p.stockQuantity <= 0}
      onPress={() =>
        addToBasket({
          id: p.id,
          name: p.name,
          price: p.price,
          stock: p.stockQuantity,
          categoryName: p.categoryName || "Uncategorized",
          promotions: p.promotions,
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
          ₱{p.price.toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* SEARCH & CATEGORIES */}
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
          <View className="w-24 flex-row items-center bg-slate-50 rounded-2xl px-3 h-12 border border-slate-100">
            <Filter size={14} color="#cbd5e1" />
            <TextInput
              placeholder="Cat..."
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
          keyExtractor={(item) => item}
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
                  selectedCategory === item ? "text-white" : "text-slate-400",
                )}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* PRODUCT GRID */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{
          justifyContent: "space-between",
          paddingHorizontal: 20,
        }}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          isLoadingProducts ? (
            <View className="px-5 flex-row flex-wrap justify-between">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <View
                  key={i}
                  className="p-4 bg-white border border-slate-50 rounded-3xl mb-4"
                  style={{ width: columnWidth }}
                >
                  <Skeleton
                    colorMode="light"
                    width={50}
                    height={10}
                    radius={4}
                  />
                  <View className="my-3">
                    <Skeleton
                      colorMode="light"
                      width={columnWidth - 60}
                      height={18}
                      radius={4}
                    />
                  </View>
                  <Skeleton
                    colorMode="light"
                    width={columnWidth - 64}
                    height={35}
                    radius={12}
                  />
                </View>
              ))}
            </View>
          ) : (
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-slate-400 font-bold">
                No products found
              </Text>
            </View>
          )
        }
      />

      {/* FLOATING CART BUTTON */}
      {basket.length > 0 && (
        <View className="absolute bottom-8 left-5 right-5">
          <TouchableOpacity
            onPress={() => setIsModalOpen(true)}
            activeOpacity={0.9}
            className="bg-slate-900 h-16 rounded-3xl flex-row items-center justify-between px-6 shadow-xl"
          >
            <View className="flex-row items-center gap-3">
              <View className="bg-white/20 p-2 rounded-xl">
                <ShoppingCart size={20} color="white" />
              </View>
              <Text className="text-white font-black text-xs uppercase tracking-tighter">
                {basket.length} Items Selected
              </Text>
            </View>
            <View className="bg-emerald-500 px-4 py-2 rounded-2xl">
              <Text className="text-white font-black text-sm">
                ₱{total.toLocaleString()}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        basket={basket}
        activePayment={activePayment}
        setActivePayment={setActivePayment}
        cashReceived={cashReceived}
        setCashReceived={setCashReceived}
        credits={credits}
        selectedCreditId={selectedCreditId}
        setSelectedCreditId={setSelectedCreditId}
        updateQuantity={updateQuantity}
        removeFromBasket={removeFromBasket}
        clearBasket={clearBasket}
        isSubmitting={isSubmitting}
        handleCheckout={handleCheckout}
        isNewCustomer={isNewCustomer}
        setIsNewCustomer={setIsNewCustomer}
        newCustomerName={newCustomerName}
        setNewCustomerName={setNewCustomerName}
        newCustomerContact={newCustomerContact}
        setNewCustomerContact={setNewCustomerContact}
      />
    </SafeAreaView>
  );
}
