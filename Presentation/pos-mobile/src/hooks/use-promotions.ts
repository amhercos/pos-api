import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { PromotionService } from "../services/promotionService";
import {
    CreatePromotionRequest,
    Promotion,
    UpdatePromotionRequest,
} from "../types/promotion";

export function usePromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await PromotionService.getAll();
      setPromotions(data);
    } catch {
      Alert.alert("Error", "Failed to load promotions");
    } finally {
      setLoading(false);
    }
  }, []);

  const addPromotion = async (
    command: CreatePromotionRequest,
  ): Promise<boolean> => {
    try {
      await PromotionService.create(command);
      await fetchPromotions();
      return true;
    } catch {
      Alert.alert("Error", "Failed to create promotion");
      return false;
    }
  };

  const updatePromotion = async (
    command: UpdatePromotionRequest,
  ): Promise<boolean> => {
    try {
      await PromotionService.update(command);
      // Optimistic update to UI list to keep it snappy
      setPromotions((prev) =>
        prev.map((p) =>
          p.id === command.id
            ? {
                ...p,
                name: command.name,
                promoPrice: command.promoPrice ?? p.promoPrice,
                promoQuantity: command.promoQuantity ?? p.promoQuantity,
                isActive: command.isActive,
              }
            : p,
        ),
      );
      return true;
    } catch {
      Alert.alert("Error", "Failed to update promotion");
      return false;
    }
  };

  const removePromotion = async (id: string): Promise<boolean> => {
    try {
      await PromotionService.delete(id);
      setPromotions((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch {
      Alert.alert("Error", "Could not delete promotion");
      return false;
    }
  };

  const calculatePreview = async (
    productId: string,
    quantity: number,
  ): Promise<number | null> => {
    try {
      return await PromotionService.getCalculatedPrice(productId, quantity);
    } catch {
      return null;
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  return {
    promotions,
    loading,
    addPromotion,
    updatePromotion,
    removePromotion,
    calculatePreview,
    refresh: fetchPromotions,
  };
}
