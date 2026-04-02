import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { emit } from "@tauri-apps/api/event"; 
import { saveOfflineTransaction, markAsSynced, markAsFailed } from "@/services/db";

import type { 
  BasketItem, 
  CreateTransactionCommand, 
  TransactionResponse, 
  Product, 
  ApiError 
} from "../types/transaction";

interface CustomWindow extends Window {
  __TAURI_INTERNALS__?: Record<string, unknown>;
}

const isRunningInTauri = (): boolean => {
  const win = window as unknown as CustomWindow;
  return typeof window !== "undefined" && win.__TAURI_INTERNALS__ !== undefined;
};

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
    let localId: string | null = null;

    if (isRunningInTauri()) {
      try {
        localId = await saveOfflineTransaction(command);
      } catch (dbErr: unknown) {
        const error = dbErr as Error;
        console.error("Local Save Error:", error.message);
        toast.error("Database Error: Transaction could not be secured locally.");
        setIsSubmitting(false);
        return false;
      }
    }

    try {
      await apiClient.post<TransactionResponse>("/Transactions/checkout", command);
      
      if (localId) {
        await markAsSynced(localId);
      }

      toast.success("Transaction completed successfully");
      clearBasket();
      return true;

    } catch (err: unknown) {
      const error = err as ApiError;
      const status: number | undefined = error.response?.status;
      const isNetworkError: boolean = !error.response || (status !== undefined && status >= 500);

      if (isRunningInTauri() && localId && isNetworkError) {
        toast.info("Offline: Saved locally", {
          description: "Transaction secured. Auto-sync will occur when connection returns.",
          duration: 5000,
        });
        
        try {
            await emit("sync:trigger", { payload: localId }); 
        } catch (e: unknown) {
            const nudgeError = e as Error;
            console.warn("Rust nudge skipped:", nudgeError.message);
        }
        
        clearBasket();
        return true;
      }

      if (localId) {
        const errorMessage: string = error.response?.data?.Message || "Validation Failed";
        await markAsFailed(localId, errorMessage);
      }

      toast.error(error.response?.data?.Message || "Checkout failed. Connection lost.");
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