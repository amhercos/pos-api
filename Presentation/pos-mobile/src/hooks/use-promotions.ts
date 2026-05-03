import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
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

  // Create Promotion
  const createMutation: UseMutationResult<
    Promotion,
    Error,
    CreatePromotionRequest
  > = useMutation({
    mutationFn: (data: CreatePromotionRequest) => promotionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
  });

  // Update Promotion
  const updateMutation: UseMutationResult<void, Error, UpdatePromotionRequest> =
    useMutation({
      mutationFn: (data: UpdatePromotionRequest) =>
        promotionService.update(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["promotions"] });
      },
    });

  // Toggle Promotion (Active/Inactive)
  const toggleMutation: UseMutationResult<void, Error, string> = useMutation({
    mutationFn: (id: string) => promotionService.toggle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
  });

  // Delete Promotion
  const deleteMutation: UseMutationResult<void, Error, string> = useMutation({
    mutationFn: (id: string) => promotionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
  });

  // Calculation Logic (Used for real-time pricing in Sales Screen)
  const calculatePrice = async (
    params: PromotionCalculationRequest,
  ): Promise<PromotionCalculationResponse> => {
    return await promotionService.calculate(params);
  };

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
