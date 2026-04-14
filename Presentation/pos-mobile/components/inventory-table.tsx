import { cn } from "@/src/lib/utils";
import type { Product } from "@/src/types/inventory";
import { Calendar, Package2, Trash2 } from "lucide-react-native";
import React, { useMemo } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

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
}: InventoryTableProps) {
  const { width } = useWindowDimensions();

  // Define breakpoints
  const isMediumScreen = width > 650;
  const isLargeScreen = width > 900;

  const stats = useMemo(() => {
    const today = new Date();
    return {
      total: products.length,
      lowStock: products.filter(
        (p) => p.stockQuantity <= p.lowStockThreshold && p.stockQuantity > 0,
      ).length,
      expired: products.filter(
        (p) => p.expiryDate && new Date(p.expiryDate) < today,
      ).length,
    };
  }, [products]);

  if (loading && products.length === 0) return null;

  return (
    <View className="flex-1">
      {/* --- Status Dashboard --- */}
      <View className="flex-row gap-3 mb-8">
        <StatusCard
          label="In Stock"
          value={stats.total}
          subLabel="Total SKU"
          accent="bg-blue-500"
        />
        <StatusCard
          label="Low Stock"
          value={stats.lowStock}
          subLabel="Restock Alert"
          accent="bg-amber-500"
        />
        <StatusCard
          label="Expired"
          value={stats.expired}
          subLabel="Check Dates"
          accent="bg-rose-500"
        />
      </View>

      <View className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden">
        <View className="flex-row items-center px-5 py-4 bg-slate-50/50 border-b border-slate-100">
          <Text className="flex-1 text-[11px] font-bold uppercase tracking-[1px] text-slate-400">
            Item
          </Text>

          {isLargeScreen && (
            <Text className="flex-1 text-[11px] font-bold uppercase tracking-[1px] text-slate-400 px-2">
              Description
            </Text>
          )}

          {isMediumScreen && (
            <>
              <Text className="w-28 text-[11px] font-bold uppercase tracking-[1px] text-slate-400 px-2">
                Category
              </Text>
              <Text className="w-32 text-[11px] font-bold uppercase tracking-[1px] text-slate-400 px-2">
                Expiry
              </Text>
            </>
          )}

          <Text className="w-20 text-right text-[11px] font-bold uppercase tracking-[1px] text-slate-400">
            Price
          </Text>
          <Text className="w-16 text-right text-[11px] font-bold uppercase tracking-[1px] text-slate-400">
            Stock
          </Text>
          <View className="w-10" />
        </View>

        <View>
          {products.length === 0 ? (
            <View className="py-12 items-center">
              <Package2 size={32} color="#e2e8f0" />
              <Text className="text-slate-400 text-xs font-medium mt-2">
                No products found
              </Text>
            </View>
          ) : (
            products.map((product, index) => {
              const isLast = index === products.length - 1;
              const isLow =
                product.stockQuantity <= product.lowStockThreshold &&
                product.stockQuantity > 0;
              const isOutOfStock = product.stockQuantity === 0;
              const isExpired =
                product.expiryDate && new Date(product.expiryDate) < new Date();

              return (
                <TouchableOpacity
                  key={product.id}
                  onPress={() => onEdit(product)}
                  activeOpacity={0.6}
                  className={cn(
                    "flex-row items-center px-5 py-3.5",
                    !isLast && "border-b border-slate-50",
                  )}
                >
                  <View className="flex-1">
                    <Text
                      className="text-[14px] font-semibold text-slate-900"
                      numberOfLines={1}
                    >
                      {product.name}
                    </Text>
                    {!isMediumScreen && (
                      <Text
                        className="text-[11px] text-slate-400 font-medium italic"
                        numberOfLines={1}
                      >
                        {product.categoryName || "No Category"}
                      </Text>
                    )}
                  </View>

                  {isLargeScreen && (
                    <View className="flex-1 px-2">
                      <Text
                        className="text-[12px] text-slate-500"
                        numberOfLines={1}
                      >
                        {product.description || "—"}
                      </Text>
                    </View>
                  )}

                  {isMediumScreen && (
                    <View className="w-28 px-2">
                      <View className="bg-indigo-50 self-start px-2 py-0.5 rounded-md">
                        <Text
                          className="text-[9px] font-bold text-indigo-600 uppercase"
                          numberOfLines={1}
                        >
                          {product.categoryName || "General"}
                        </Text>
                      </View>
                    </View>
                  )}

                  {isMediumScreen && (
                    <View className="w-32 px-2">
                      {product.expiryDate ? (
                        <View className="flex-row items-center">
                          <Calendar
                            size={12}
                            color={isExpired ? "#ef4444" : "#94a3b8"}
                          />
                          <Text
                            className={cn(
                              "text-[11px] font-medium ml-1.5",
                              isExpired ? "text-rose-500" : "text-slate-500",
                            )}
                          >
                            {new Date(product.expiryDate).toLocaleDateString()}
                          </Text>
                        </View>
                      ) : (
                        <Text className="text-[11px] text-slate-300 italic">
                          No Expiry
                        </Text>
                      )}
                    </View>
                  )}

                  <View className="w-20">
                    <Text className="text-[13px] font-bold text-slate-900 text-right">
                      ₱{product.price.toLocaleString()}
                    </Text>
                  </View>

                  <View className="w-16 items-end">
                    <View
                      className={cn(
                        "px-2 py-0.5 rounded-full",
                        isOutOfStock
                          ? "bg-slate-100"
                          : isLow
                            ? "bg-rose-50"
                            : "bg-emerald-50",
                      )}
                    >
                      <Text
                        className={cn(
                          "text-[11px] font-bold",
                          isOutOfStock
                            ? "text-slate-400"
                            : isLow
                              ? "text-rose-600"
                              : "text-emerald-600",
                        )}
                      >
                        {product.stockQuantity}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    className="w-10 items-end py-2"
                    onPress={() => onDelete(product.id)}
                  >
                    <Trash2 size={15} color="#cbd5e1" />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </View>
    </View>
  );
}

function StatusCard({
  label,
  value,
  subLabel,
  accent,
}: {
  label: string;
  value: number;
  subLabel: string;
  accent: string;
}) {
  return (
    <View className="flex-1 bg-white border border-slate-100 p-4 rounded-[24px] shadow-sm relative overflow-hidden">
      <View className={cn("absolute top-0 left-0 bottom-0 w-1", accent)} />
      <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
        {label}
      </Text>
      <Text className="text-2xl font-black text-slate-900 mb-0.5">{value}</Text>
      <Text className="text-[9px] font-medium text-slate-400">{subLabel}</Text>
    </View>
  );
}
