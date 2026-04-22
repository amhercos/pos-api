import { cn } from "@/src/lib/utils";
import type { Product } from "@/src/types/inventory";
import {
  ArrowRight,
  Calendar,
  ChevronsUpDown,
  Package2,
  Trash2
} from "lucide-react-native";
import React, { ReactElement, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ConfirmationModal } from "./ConfirmationModal";

interface InventoryTableProps {
  products: Product[];
  loading: boolean;
  onDelete: (id: string) => void;
  onEdit: (product: Product) => void;
}

export function InventoryTable({
  products,
  loading,
  onDelete,
  onEdit,
}: InventoryTableProps): ReactElement | null {
  const [priceSort, setPriceSort] = useState<"none" | "asc" | "desc">("none");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const sortedProducts = useMemo(() => {
    if (priceSort === "none") return products;
    return [...products].sort((a, b) =>
      priceSort === "asc" ? a.price - b.price : b.price - a.price,
    );
  }, [products, priceSort]);

  if (loading && products.length === 0) return null;

  return (
    <View className="flex-1">
      <ConfirmationModal
        visible={!!deleteTargetId}
        title="Remove Product"
        description="Are you sure? This will permanently delete the product from your inventory records."
        onConfirm={() => {
          if (deleteTargetId) onDelete(deleteTargetId);
          setDeleteTargetId(null);
        }}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* --- TABLE HEADER --- */}
      <View className="flex-row items-center pb-4 border-b border-slate-100 px-4">
        {/* Expanded Product Space */}
        <Text className="flex-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
          Product Info
        </Text>

        {/* Anchored Right Columns */}
        <View className="flex-row items-center">
          <View className="w-[65px] items-end">
            <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Exp
            </Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              setPriceSort((curr) => (curr === "asc" ? "desc" : "asc"))
            }
            className="w-[85px] flex-row items-center justify-end gap-1"
          >
            <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Price
            </Text>
            <ChevronsUpDown size={8} color="#cbd5e1" />
          </TouchableOpacity>
          <View className="w-[50px] items-end">
            <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Qty
            </Text>
          </View>
          <View className="w-8" />
        </View>
      </View>

      {/* --- TABLE ROWS --- */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {sortedProducts.map((product) => {
          const isLow = product.stockQuantity <= product.lowStockThreshold;
          const isExpired =
            product.expiryDate && new Date(product.expiryDate) < new Date();

          return (
            <TouchableOpacity
              key={product.id}
              onPress={() => onEdit(product)}
              className="flex-row items-center py-6 border-b border-slate-50 px-4"
            >
              {/* Product Info (Takes all remaining space) */}
              <View className="flex-1 pr-6">
                <Text
                  className="text-[15px] font-bold text-slate-900 leading-tight"
                  numberOfLines={1}
                >
                  {product.name}
                </Text>
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  {product.categoryName ?? "General"}
                </Text>
              </View>

              {/* Data metrics pushed to the right */}
              <View className="flex-row items-center">
                <View className="w-[65px] items-end">
                  <Text
                    className={cn(
                      "text-[11px] font-bold",
                      isExpired ? "text-rose-500" : "text-slate-400",
                    )}
                  >
                    {product.expiryDate
                      ? new Date(product.expiryDate).toLocaleDateString(
                          undefined,
                          { month: "short", year: "2-digit" },
                        )
                      : "—"}
                  </Text>
                </View>

                <View className="w-[85px] items-end">
                  <Text className="text-[14px] font-black text-slate-900">
                    ₱{Math.round(product.price).toLocaleString()}
                  </Text>
                </View>

                <View className="w-[50px] items-end">
                  <Text
                    className={cn(
                      "text-[15px] font-black",
                      isLow ? "text-amber-500" : "text-emerald-600",
                    )}
                  >
                    {product.stockQuantity}
                  </Text>
                </View>

                <TouchableOpacity
                  className="w-8 items-end"
                  onPress={() => setDeleteTargetId(product.id)}
                >
                  <Trash2 size={14} color="#e2e8f0" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

{
  /* --- REDESIGNED CARD VIEW --- */
}
export function ProductCard({
  product,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
}): ReactElement {
  const isLow = product.stockQuantity <= product.lowStockThreshold;
  const isExpired =
    product.expiryDate && new Date(product.expiryDate) < new Date();

  return (
    <TouchableOpacity
      onPress={() => onEdit(product)}
      activeOpacity={0.9}
      className="bg-white rounded-[40px] p-8 mb-6 shadow-2xl shadow-slate-200 border border-slate-50"
    >
      {/* 1. Header: Primary Identity & Delete Action */}
      <View className="flex-row justify-between items-start mb-6">
        <View className="flex-1 pr-6">
          <View className="bg-slate-100 self-start px-3 py-1 rounded-lg mb-3">
            <Text className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
              {product.categoryName ?? "General"}
            </Text>
          </View>
          <Text className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
            {product.name}
          </Text>
          <Text className="text-[11px] font-bold text-slate-300 mt-1 uppercase tracking-tighter">
            ID: {product.id.slice(0, 12)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => onDelete(product.id)}
          className="bg-rose-50 w-12 h-12 items-center justify-center rounded-2xl"
        >
          <Trash2 size={20} color="#f43f5e" />
        </TouchableOpacity>
      </View>

      {/* 2. Metrics: Large indicators for Stock & Expiry */}
      <View className="flex-row gap-4 mb-8">
        {/* Stock Status */}
        <View
          className={cn(
            "flex-1 p-5 rounded-[28px] border",
            isLow
              ? "bg-amber-50 border-amber-100"
              : "bg-emerald-50 border-emerald-100",
          )}
        >
          <View className="flex-row items-center gap-2 mb-2">
            <Package2 size={14} color={isLow ? "#d97706" : "#059669"} />
            <Text
              className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                isLow ? "text-amber-600" : "text-emerald-600",
              )}
            >
              Stock
            </Text>
          </View>
          <Text
            className={cn(
              "text-3xl font-black",
              isLow ? "text-amber-700" : "text-emerald-700",
            )}
          >
            {product.stockQuantity}
          </Text>
          <Text className="text-[10px] font-bold opacity-50 mt-1">
            Min: {product.lowStockThreshold}
          </Text>
        </View>

        {/* Expiry Status */}
        <View
          className={cn(
            "flex-1 p-5 rounded-[28px] border",
            isExpired
              ? "bg-rose-50 border-rose-100"
              : "bg-slate-50 border-slate-100",
          )}
        >
          <View className="flex-row items-center gap-2 mb-2">
            <Calendar size={14} color={isExpired ? "#e11d48" : "#64748b"} />
            <Text
              className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                isExpired ? "text-rose-600" : "text-slate-400",
              )}
            >
              Expiry
            </Text>
          </View>
          <Text
            className={cn(
              "text-2xl font-black",
              isExpired ? "text-rose-700" : "text-slate-900",
            )}
          >
            {product.expiryDate
              ? new Date(product.expiryDate).toLocaleDateString(undefined, {
                  month: "short",
                  year: "2-digit",
                })
              : "—"}
          </Text>
          <Text
            className={cn(
              "text-[10px] font-bold mt-1",
              isExpired ? "text-rose-400" : "text-slate-400",
            )}
          >
            {isExpired ? "Expired" : "Fresh"}
          </Text>
        </View>
      </View>

      {/* 3. Footer: Price & Direct CTA */}
      <View className="flex-row items-center justify-between pt-6 border-t border-slate-50">
        <View>
          <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-1">
            Unit Price
          </Text>
          <Text className="text-3xl font-black text-slate-900">
            ₱{product.price.toLocaleString()}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => onEdit(product)}
          className="bg-slate-900 px-8 py-4 rounded-2xl flex-row items-center gap-2"
        >
          <Text className="text-white font-black text-[13px] uppercase">
            Edit
          </Text>
          <ArrowRight size={14} color="white" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
