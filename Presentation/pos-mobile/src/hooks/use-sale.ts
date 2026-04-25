import { apiClient } from "@/src/api/client";
import { roundTo } from "@/src/lib/math"; // Essential for Senior precision
import { calculateLineTotal } from "@/src/lib/pricing";
import {
  PaymentType,
  type ApiError,
  type BasketItem,
  type CheckoutParams,
  type CreateTransactionCommand,
  type Product,
  type TransactionResponse,
} from "@/src/types/sale";
import { isAxiosError, type AxiosError } from "axios";
import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";

/**
 * Senior-level hook for managing POS sale state and operations.
 * Implements strict precision rounding and optimized state transitions.
 */
export function useSale() {
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /**
   * Memoized total calculation with high precision.
   * Uses roundTo to ensure the UI sum perfectly matches the DB sum.
   */
  const total = useMemo((): number => {
    const rawTotal = basket.reduce(
      (acc, item) => acc + calculateLineTotal(item, basket),
      0,
    );
    return roundTo(rawTotal);
  }, [basket]);

  const addToBasket = useCallback((product: Product): void => {
    setBasket((prev) => {
      const existingItem = prev.find((item) => item.productId === product.id);

      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          Alert.alert("Stock Limit", `Only ${product.stock} units available.`);
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
          promotions: product.promotions,
        },
      ];
    });
  }, []);

  const removeFromBasket = useCallback((productId: string): void => {
    setBasket((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, delta: number): void => {
      setBasket((prev) =>
        prev.map((item) => {
          if (item.productId !== productId) return item;

          const nextQty = item.quantity + delta;

          // Guard against negative quantities or exceeding stock
          if (nextQty <= 0 || nextQty > item.stock) return item;

          return { ...item, quantity: nextQty };
        }),
      );
    },
    [],
  );

  const clearBasket = useCallback((): void => setBasket([]), []);

  /**
   * Finalizes the transaction.
   * Maps current state to a CreateTransactionCommand with strict precision.
   */
  const checkout = async (params: CheckoutParams): Promise<boolean> => {
    if (basket.length === 0) return false;

    // Ensure total is captured at the moment of checkout
    const capturedTotal = total;
    const capturedCash = params.cashReceived ?? 0;

    // Strict validation for cash payments
    if (
      params.paymentType === PaymentType.Cash &&
      capturedCash < capturedTotal
    ) {
      Alert.alert(
        "Invalid Payment",
        "Cash received is less than the total amount.",
      );
      return false;
    }

    setIsSubmitting(true);

    try {
      const command: CreateTransactionCommand = {
        items: basket.map((item) => {
          const lineTotal = calculateLineTotal(item, basket);
          return {
            productId: item.productId,
            quantity: item.quantity,
            // Calculate effective unit price rounded to 2 decimals to match backend logic
            unitPrice: roundTo(lineTotal / item.quantity, 2),
          };
        }),
        paymentType: params.paymentType,
        totalAmount: capturedTotal,
        cashReceived: roundTo(capturedCash, 2),
        changeAmount:
          params.paymentType === PaymentType.Cash
            ? roundTo(Math.max(0, capturedCash - capturedTotal), 2)
            : 0,
        customerCreditId: params.customerCreditId,
        newCustomerName: params.newCustomerName,
        newCustomerContact: params.newCustomerContact,
      };

      await apiClient.post<TransactionResponse>(
        "/Transactions/checkout",
        command,
      );

      Alert.alert("Success", "Transaction finalized successfully.");
      clearBasket();
      return true;
    } catch (err) {
      handleApiError(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    basket,
    total,
    addToBasket,
    removeFromBasket,
    updateQuantity,
    clearBasket,
    checkout,
    isSubmitting,
  };
}

/**
 * Standardized API error surfacing.
 * Handles Axios errors and extracts meaningful messages from the API.
 */
function handleApiError(err: unknown): void {
  let message = "An error occurred while processing the sale.";

  if (isAxiosError(err)) {
    const axiosError = err as AxiosError<ApiError>;

    // Check for specific backend messages or fallback to Axios default
    message = axiosError.response?.data?.message ?? axiosError.message;

    // Log the error for internal tracking (Senior Practice)
    if (__DEV__) {
      console.error(
        "[Checkout API Error]:",
        axiosError.response?.data || axiosError.message,
      );
    }
  }

  Alert.alert("Checkout Error", message);
}
