import { useInventory } from "@/src/hooks/user-inventory";
import { cn } from "@/src/lib/utils";
import type { Category, Product } from "@/src/types/inventory";
import {
  Calendar,
  Edit3,
  FolderPlus,
  LayoutGrid,
  List as ListIcon,
  Plus,
  Search,
  Tag,
  X,
} from "lucide-react-native";
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Local Components
import { InventoryTable } from "../../components/inventory-table";
import { AddProductModal } from "../../components/inventory/add-product-modal";
import { CategoryManagerModal } from "../../components/inventory/category-manager-modal";
import { EditProductModal } from "../../components/inventory/edit-product-modal";

/** Strict Types */
type FilterType =
  | "all"
  | "low-stock"
  | "out-of-stock"
  | "expired"
  | "non-perishable"
  | "no-category";
type ViewMode = "table" | "grid";

export default function InventoryScreen(): ReactElement {
  const { width } = useWindowDimensions();
  const {
    products = [],
    categories = [],
    loading,
    refresh,
    addProduct,
    deleteProduct,
    updateProduct,
    addCategory,
    deleteCategory,
  } = useInventory();

  // Local UI State
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [modals, setModals] = useState({ add: false, edit: false, cat: false });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Search & Filter State
  const [search, setSearch] = useState<string>("");
  const [categorySearch, setCategorySearch] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<FilterType | string>("all");

  useEffect(() => {
    refresh(1, 50);
  }, [refresh]);

  /** Performance Optimized Callbacks */
  const toggleViewMode = useCallback(
    () => setViewMode((v) => (v === "table" ? "grid" : "table")),
    [],
  );

  const handleEditPress = useCallback((product: Product) => {
    setSelectedProduct(product);
    setModals((m) => ({ ...m, edit: true }));
  }, []);

  const filteredCategories = useMemo((): Category[] => {
    if (!categorySearch) return categories;
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(categorySearch.toLowerCase()),
    );
  }, [categories, categorySearch]);

  const filteredProducts = useMemo((): Product[] => {
    const today = new Date();
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description?.toLowerCase().includes(search.toLowerCase()) ?? false);
      if (!matchesSearch) return false;

      if (activeFilter === "all") return true;
      if (activeFilter === "low-stock")
        return p.stockQuantity <= p.lowStockThreshold && p.stockQuantity > 0;
      if (activeFilter === "out-of-stock") return p.stockQuantity === 0;
      if (activeFilter === "expired")
        return p.expiryDate ? new Date(p.expiryDate) < today : false;
      return p.categoryId === activeFilter;
    });
  }, [products, search, activeFilter]);

  const GRID_ITEM_WIDTH = (width - 48) / 2;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* --- Header (Always Visible) --- */}
      <View className="px-5 py-4 flex-row items-center justify-between border-b border-slate-50">
        <View>
          <Text className="text-2xl font-black text-slate-900 tracking-tighter">
            Inventory
          </Text>
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {filteredProducts.length} Results
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={toggleViewMode}
            className="bg-slate-100 p-2.5 rounded-xl"
          >
            {viewMode === "table" ? (
              <LayoutGrid size={18} color="#64748b" />
            ) : (
              <ListIcon size={18} color="#64748b" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setModals((m) => ({ ...m, add: true }))}
            className="bg-slate-900 flex-row items-center px-4 h-11 rounded-xl shadow-sm"
          >
            <Plus size={16} color="white" />
            <Text className="text-white text-xs font-bold ml-2">Product</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- Main Scrollable Area --- */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Search & Filters: Inside ScrollView so they vanish on landscape scroll */}
        <View className="px-5 py-4 bg-slate-50/30">
          <View className="flex-row items-center gap-2 mb-4">
            <View className="relative flex-1 justify-center">
              <View className="absolute left-3.5 z-10">
                <Search size={14} color="#94a3b8" />
              </View>
              <TextInput
                placeholder="Search inventory..."
                value={search}
                onChangeText={setSearch}
                className="bg-white border border-slate-200 h-11 pl-10 pr-4 rounded-2xl text-[13px] font-bold text-slate-900"
              />
            </View>
            <TouchableOpacity
              onPress={() => setModals((m) => ({ ...m, cat: true }))}
              className="bg-white border border-slate-200 h-11 w-11 items-center justify-center rounded-2xl shadow-sm"
            >
              <FolderPlus size={18} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row items-center gap-2 pr-10">
              {["all", "low-stock", "expired"].map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setActiveFilter(f)}
                  className={cn(
                    "px-4 py-2 rounded-full border h-9",
                    activeFilter === f
                      ? "bg-slate-900 border-slate-900"
                      : "bg-white border-slate-200",
                  )}
                >
                  <Text
                    className={cn(
                      "text-[10px] font-black uppercase",
                      activeFilter === f ? "text-white" : "text-slate-500",
                    )}
                  >
                    {f.replace("-", " ")}
                  </Text>
                </TouchableOpacity>
              ))}
              <View className="w-[1px] h-4 bg-slate-200 mx-1" />
              <View className="flex-row items-center bg-white border border-slate-200 rounded-full h-9 px-3 min-w-[120px]">
                <TextInput
                  placeholder="Category..."
                  value={categorySearch}
                  onChangeText={setCategorySearch}
                  className="flex-1 text-[10px] font-bold p-0"
                />
                {categorySearch.length > 0 && (
                  <TouchableOpacity onPress={() => setCategorySearch("")}>
                    <X size={12} color="#94a3b8" />
                  </TouchableOpacity>
                )}
              </View>
              {filteredCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setActiveFilter(cat.id)}
                  className={cn(
                    "px-4 py-2 rounded-full border h-9 flex-row items-center gap-1.5",
                    activeFilter === cat.id
                      ? "bg-slate-900 border-slate-900"
                      : "bg-white border-slate-200",
                  )}
                >
                  <Tag
                    size={10}
                    color={activeFilter === cat.id ? "white" : "#94a3b8"}
                  />
                  <Text
                    className={cn(
                      "text-[10px] font-black uppercase",
                      activeFilter === cat.id ? "text-white" : "text-slate-500",
                    )}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Content Area */}
        <View className="px-5 pt-2 pb-20">
          {loading && products.length === 0 ? (
            <ActivityIndicator className="mt-20" color="#0f172a" />
          ) : viewMode === "table" ? (
            <InventoryTable
              products={filteredProducts}
              loading={loading}
              onDelete={deleteProduct}
              onEdit={handleEditPress}
            />
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {filteredProducts.map((p) => (
                <InventoryGridCard
                  key={p.id}
                  product={p}
                  width={GRID_ITEM_WIDTH}
                  onEdit={() => handleEditPress(p)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modals */}
      <CategoryManagerModal
        isOpen={modals.cat}
        onClose={() => setModals((m) => ({ ...m, cat: false }))}
        categories={categories}
        onAdd={addCategory}
        onDelete={deleteCategory}
      />
      <AddProductModal
        isOpen={modals.add}
        onClose={() => setModals((m) => ({ ...m, add: false }))}
        categories={categories}
        onAdd={addProduct}
        onOpenCategoryManager={() => setModals((m) => ({ ...m, cat: true }))}
      />
      <EditProductModal
        isOpen={modals.edit}
        onClose={() => {
          setModals((m) => ({ ...m, edit: false }));
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        categories={categories}
        onUpdate={updateProduct}
        onOpenCategoryManager={() => setModals((m) => ({ ...m, cat: true }))}
      />
    </SafeAreaView>
  );
}

function InventoryGridCard({
  product,
  onEdit,
  width,
}: {
  product: Product;
  onEdit: () => void;
  width: number;
}): ReactElement {
  const isExpired =
    product.expiryDate && new Date(product.expiryDate) < new Date();
  return (
    <TouchableOpacity
      onPress={onEdit}
      style={{ width }}
      className="bg-white border border-slate-100 rounded-3xl p-4 mb-4 shadow-sm"
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-[16px] font-black text-slate-900">
          ₱{product.price.toLocaleString()}
        </Text>
        {isExpired && <Calendar size={14} color="#ef4444" />}
      </View>
      <Text
        className="text-[13px] font-bold text-slate-800 h-9"
        numberOfLines={2}
      >
        {product.name}
      </Text>
      <View className="mt-3 pt-3 border-t border-slate-50 flex-row justify-between">
        <Text className="text-[10px] font-black text-slate-400 uppercase">
          {product.stockQuantity} Qty
        </Text>
        <Edit3 size={14} color="#cbd5e1" />
      </View>
    </TouchableOpacity>
  );
}
