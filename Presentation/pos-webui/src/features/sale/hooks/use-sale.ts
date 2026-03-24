import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import type { BasketItem, CreateTransactionCommand, TransactionResponse, Product, ApiError } from "../types/transaction";

export function useSale() {
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addToBasket = (product: Product) => {
    setBasket((prev) => {
      const existingItem = prev.find((item) => item.productId === product.id);
      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          toast.error(`Stock limit reached (${product.stock} available)`);
          return prev;
        }
        return prev.map((item) => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productId: product.id, name: product.name, quantity: 1, unitPrice: product.price, stock: product.stock }];
    });
  };

  const removeFromBasket = (productId: string) => setBasket((prev) => prev.filter((item) => item.productId !== productId));

  const updateQuantity = (productId: string, delta: number) => {
    setBasket((prev) => prev.map((item) => {
      if (item.productId !== productId) return item;
      const newQty = item.quantity + delta;
      return (newQty > 0 && newQty <= item.stock) ? { ...item, quantity: newQty } : item;
    }));
  };

  const checkout = async (command: CreateTransactionCommand): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await apiClient.post<TransactionResponse>("/Transactions/checkout", command);
      toast.success("Transaction completed successfully");
      setBasket([]);
      return true;
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.response?.data?.Message || "Checkout failed");
      return false;
    } finally { setIsSubmitting(false); }
  };

  return { basket, addToBasket, removeFromBasket, updateQuantity, checkout, isSubmitting };
}