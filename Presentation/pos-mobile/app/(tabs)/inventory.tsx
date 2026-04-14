import { useInventory } from "@/src/hooks/user-inventory";
import { cn } from "@/src/lib/utils";
import type { Product } from "@/src/types/inventory";
import { FolderPlus, Plus, Search, Tag, X } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { InventoryTable } from "../../components/inventory-table";
import { AddProductModal } from "../../components/inventory/add-product-modal";
import { CategoryManagerModal } from "../../components/inventory/category-manager-modal";
import { EditProductModal } from "../../components/inventory/edit-product-modal";

type FilterType =
  | "all"
  | "low-stock"
  | "out-of-stock"
  | "expired"
  | "non-perishable"
  | "no-category";

export default function InventoryScreen() {
  const PAGE_SIZE = 50;
  const {
    products,
    categories,
    loading,
    refresh,
    addProduct,
    deleteProduct,
    updateProduct,
    addCategory,
    deleteCategory,
  } = useInventory();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [search, setSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType | string>("all");

  useEffect(() => {
    refresh(1, PAGE_SIZE);
  }, [refresh]);

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(categorySearch.toLowerCase()),
    );
  }, [categories, categorySearch]);

  const filteredProducts = useMemo(() => {
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
        return p.expiryDate && new Date(p.expiryDate) < today;
      if (activeFilter === "non-perishable") return !p.expiryDate;
      if (activeFilter === "no-category") return !p.categoryId;

      return p.categoryId === activeFilter;
    });
  }, [products, search, activeFilter]);

  return (
    <View className="flex-1 bg-white">
      {/* --- Header --- */}
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-100 bg-white">
        <Text className="text-xl font-black text-slate-900 tracking-tight">
          Inventory
        </Text>
        <TouchableOpacity
          onPress={() => setIsAddModalOpen(true)}
          className="bg-slate-900 flex-row items-center px-4 py-2 rounded-xl shadow-sm"
        >
          <Plus size={16} color="white" />
          <Text className="text-white text-xs font-bold ml-2">Add Product</Text>
        </TouchableOpacity>
      </View>

      {/* --- Search & Filters --- */}
      <View className="px-6 py-4 bg-slate-50/50">
        <View className="flex-row items-center gap-2 mb-4">
          <View className="relative flex-1 justify-center">
            <View className="absolute left-3 z-10">
              <Search size={16} color="#cbd5e1" />
            </View>
            <TextInput
              placeholder="Search items..."
              value={search}
              onChangeText={setSearch}
              className="bg-white border border-slate-200 h-11 pl-10 pr-4 rounded-2xl text-sm font-medium text-slate-900 shadow-sm"
            />
          </View>
          <TouchableOpacity
            onPress={() => setIsCatModalOpen(true)}
            className="bg-white border border-slate-200 h-11 w-11 items-center justify-center rounded-2xl shadow-sm"
          >
            <FolderPlus size={18} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* --- Scrollable Filter Chips --- */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row items-center gap-2 pr-10">
            <FilterChip
              label="All"
              active={activeFilter === "all"}
              onPress={() => setActiveFilter("all")}
            />

            <View className="w-[1px] h-4 bg-slate-300 mx-1" />

            {/* Status Based Filters */}
            <FilterChip
              label="Low Stock"
              active={activeFilter === "low-stock"}
              onPress={() => setActiveFilter("low-stock")}
            />
            <FilterChip
              label="Out of Stock"
              active={activeFilter === "out-of-stock"}
              onPress={() => setActiveFilter("out-of-stock")}
            />
            <FilterChip
              label="Expired"
              active={activeFilter === "expired"}
              onPress={() => setActiveFilter("expired")}
            />
            <FilterChip
              label="Non-Perishable"
              active={activeFilter === "non-perishable"}
              onPress={() => setActiveFilter("non-perishable")}
            />

            <View className="w-[1px] h-4 bg-slate-300 mx-1" />

            {/* Category Section */}
            <FilterChip
              label="Uncategorized"
              active={activeFilter === "no-category"}
              onPress={() => setActiveFilter("no-category")}
            />

            {/* Category Search Input */}
            <View className="flex-row items-center bg-white border border-slate-200 rounded-full h-9 px-3 min-w-[140px]">
              <Search size={12} color="#94a3b8" />
              <TextInput
                placeholder="Find category..."
                value={categorySearch}
                onChangeText={setCategorySearch}
                className="flex-1 text-[11px] font-bold text-slate-900 ml-1.5 p-0"
                placeholderTextColor="#cbd5e1"
              />
              {categorySearch.length > 0 && (
                <TouchableOpacity onPress={() => setCategorySearch("")}>
                  <X size={12} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Category Map */}
            {filteredCategories.map((cat) => (
              <FilterChip
                key={cat.id}
                label={cat.name}
                active={activeFilter === cat.id}
                onPress={() => setActiveFilter(cat.id)}
                icon={
                  <Tag
                    size={10}
                    color={activeFilter === cat.id ? "white" : "#94a3b8"}
                  />
                }
              />
            ))}
          </View>
        </ScrollView>
      </View>

      {/* --- Table Section --- */}
      <ScrollView
        className="flex-1 px-6 pt-4"
        showsVerticalScrollIndicator={false}
      >
        {loading && products.length === 0 ? (
          <ActivityIndicator className="mt-20" color="#0f172a" />
        ) : (
          <View className="pb-10">
            <InventoryTable
              products={filteredProducts}
              loading={loading}
              onDelete={deleteProduct}
              onEdit={(p) => {
                setSelectedProduct(p);
                setIsEditModalOpen(true);
              }}
            />
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <CategoryManagerModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        categories={categories}
        onAdd={addCategory}
        onDelete={deleteCategory}
      />
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        categories={categories}
        onAdd={addProduct}
        onOpenCategoryManager={() => setIsCatModalOpen(true)}
      />
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        categories={categories}
        onUpdate={updateProduct}
        onOpenCategoryManager={() => setIsCatModalOpen(true)}
      />
    </View>
  );
}

function FilterChip({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={cn(
        "px-4 py-1.5 rounded-full border shadow-sm flex-row items-center gap-1.5 h-9",
        active ? "bg-slate-900 border-slate-900" : "bg-white border-slate-200",
      )}
    >
      {icon}
      <Text
        className={cn(
          "text-[11px] font-bold",
          active ? "text-white" : "text-slate-500",
        )}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
