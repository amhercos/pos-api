import { apiClient } from "@/src/api/client";
import type {
    ApiError,
    BasketItem,
    CreateTransactionCommand,
    Product,
    TransactionResponse,
} from "@/src/types/sale";
import { isAxiosError, type AxiosError } from "axios";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

export function useSale() {
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const addToBasket = (product: Product): void => {
    setBasket((prev) => {
      const existingItem = prev.find((item) => item.productId === product.id);
      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          Alert.alert("Stock Limit", "Cannot add more than available stock.");
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          quantity: 1,
          unitPrice: product.price,
          stock: product.stock,
        },
      ];
    });
  };

  const removeFromBasket = (productId: string): void =>
    setBasket((prev) => prev.filter((item) => item.productId !== productId));

  const updateQuantity = (productId: string, delta: number): void => {
    setBasket((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;
        const newQty = item.quantity + delta;
        if (newQty > 0 && newQty <= item.stock)
          return { ...item, quantity: newQty };
        return item;
      }),
    );
  };

  const clearBasket = useCallback(() => setBasket([]), []);

  const checkout = async (
    command: CreateTransactionCommand,
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await apiClient.post<TransactionResponse>(
        "/Transactions/checkout",
        command,
      );
      Alert.alert("Success", "Transaction recorded successfully.");
      clearBasket();
      return true;
    } catch (err) {
      let msg = "An unexpected error occurred.";
      if (isAxiosError(err)) {
        const error = err as AxiosError<ApiError>;
        msg = error.response?.data?.message || err.message;
      }
      Alert.alert("Error", msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    basket,
    addToBasket,
    removeFromBasket,
    updateQuantity,
    clearBasket,
    checkout,
    isSubmitting,
  };
}
