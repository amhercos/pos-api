import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult
} from "@tanstack/react-query";
import { useCallback } from "react";
import { promotionService } from "../services/promotionService";
import {
  CreatePromotionRequest,
  Promotion,
  PromotionCalculationRequest,
  PromotionCalculationResponse,
  UpdatePromotionRequest,
} from "../types/promotion";

export const usePromotions = () => {
  const queryClient = useQueryClient();

  const {
    data: promotions = [],
    isLoading,
    refetch,
  }: UseQueryResult<Promotion[], Error> = useQuery({
    queryKey: ["promotions"],
    queryFn: promotionService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePromotionRequest) => promotionService.create(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["promotions"] }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdatePromotionRequest) => promotionService.update(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["promotions"] }),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => promotionService.toggle(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["promotions"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => promotionService.delete(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["promotions"] }),
  });

  // Optimized with useCallback for TransactionContent useEffect stability
  const calculatePrice = useCallback(
    async (
      params: PromotionCalculationRequest,
    ): Promise<PromotionCalculationResponse> => {
      return await promotionService.calculate(params);
    },
    [],
  );

  return {
    promotions,
    isLoading,
    isProcessing:
      createMutation.isPending ||
      updateMutation.isPending ||
      toggleMutation.isPending ||
      deleteMutation.isPending,
    addPromotion: createMutation.mutate,
    updatePromotion: updateMutation.mutate,
    togglePromotion: toggleMutation.mutate,
    removePromotion: deleteMutation.mutate,
    refresh: refetch,
    calculatePrice,
  };
};
