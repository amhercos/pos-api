import { useState, useCallback } from "react";
import axios, { type AxiosError } from "axios";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import type { 
  BasketItem, 
  CreateTransactionCommand, 
  TransactionResponse, 
  Product, 
  ApiError 
} from "../types/transaction";

export function useSale() {
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const addToBasket = (product: Product): void => {
    setBasket((prev: BasketItem[]): BasketItem[] => {
      const existingItem = prev.find((item: BasketItem) => item.productId === product.id);
      
      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          toast.error(`Stock limit reached (${product.stock} available)`);
          return prev;
        }
        return prev.map((item: BasketItem) => 
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...prev, { 
        productId: product.id, 
        name: product.name, 
        quantity: 1, 
        unitPrice: product.price, 
        stock: product.stock 
      }];
    });
  };

  const removeFromBasket = (productId: string): void => 
    setBasket((prev: BasketItem[]): BasketItem[] => prev.filter((item: BasketItem) => item.productId !== productId));

  const updateQuantity = (productId: string, delta: number): void => {
    setBasket((prev: BasketItem[]): BasketItem[] => prev.map((item: BasketItem) => {
      if (item.productId !== productId) return item;
      const newQty = item.quantity + delta;
      
      if (newQty > 0 && newQty <= item.stock) return { ...item, quantity: newQty };
      if (newQty > item.stock) toast.warning("Cannot exceed available stock");
      
      return item;
    }));
  };

  const clearBasket = useCallback((): void => setBasket([]), []);

  const checkout = async (command: CreateTransactionCommand): Promise<boolean> => {
    if (basket.length === 0) return false;
    
    setIsSubmitting(true);

    try {
      await apiClient.post<TransactionResponse>("/Transactions/checkout", command);
      
      toast.success("Transaction completed successfully");
      clearBasket();
      return true;

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const error = err as AxiosError<ApiError>;
        const errorMessage = error.response?.data?.message || "Checkout failed. Connection to local engine lost.";
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred during checkout.");
      }
      return false;

    } finally {
      setIsSubmitting(false);
    }
  };

  return { 
    basket, 
    setBasket, 
    addToBasket, 
    removeFromBasket, 
    updateQuantity, 
    clearBasket, 
    checkout, 
    isSubmitting 
  };
}