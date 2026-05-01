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
    mainProductId: string,
    command: UpdatePromotionRequest,
  ): Promise<boolean> => {
    try {
      await PromotionService.update(mainProductId, command);
      await fetchPromotions();
      return true;
    } catch {
      Alert.alert("Error", "Failed to update promotion");
      return false;
    }
  };

  const removePromotion = async (mainProductId: string): Promise<boolean> => {
    try {
      await PromotionService.delete(mainProductId);
      setPromotions((prev) =>
        prev.filter((p) => p.mainProductId !== mainProductId),
      );
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

  const togglePromotion = async (mainProductId: string): Promise<boolean> => {
    const previousPromotions = [...promotions];

    setPromotions((prev) =>
      prev.map((p) =>
        p.mainProductId === mainProductId ? { ...p, isActive: !p.isActive } : p,
      ),
    );

    try {
      await PromotionService.toggle(mainProductId);
      return true;
    } catch {
      setPromotions(previousPromotions);
      Alert.alert("Error", "Failed to toggle promotion status");
      return false;
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
    togglePromotion,
    calculatePreview,
    refresh: fetchPromotions,
  };
}
