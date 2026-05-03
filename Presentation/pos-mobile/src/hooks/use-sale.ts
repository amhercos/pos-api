import { apiClient } from "@/src/api/client";
import { roundTo } from "@/src/lib/math";
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
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { calculateBestPromo } from "../utils/promotion-engine";

export function useSale() {
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Helper to get evaluated totals for any payment type
  const calculateTotal = useCallback(
    (paymentType: PaymentType): number => {
      const rawTotal = basket.reduce((acc, item) => {
        if (paymentType === PaymentType.Credit) {
          return acc + item.unitPrice * item.quantity;
        }
        // FIX: Use the new promo engine here
        const { total } = calculateBestPromo(item, basket);
        return acc + total;
      }, 0);

      return roundTo(rawTotal);
    },
    [basket],
  );

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

  const removeItem = useCallback((productId: string): void => {
    setBasket((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  // Updated to handle absolute quantity instead of delta for better predictability
  const updateQuantity = useCallback(
    (productId: string, nextQty: number): void => {
      setBasket((prev) =>
        prev.map((item) => {
          if (item.productId !== productId) return item;

          if (nextQty > item.stock) {
            Alert.alert("Stock Limit", `Cannot exceed ${item.stock} units.`);
            return item;
          }
          if (nextQty <= 0) return item;

          return { ...item, quantity: nextQty };
        }),
      );
    },
    [],
  );

  const clearBasket = useCallback((): void => setBasket([]), []);

  const checkout = async (params: CheckoutParams): Promise<boolean> => {
    if (basket.length === 0) return false;

    const capturedTotal = calculateTotal(params.paymentType);
    const capturedCash = params.cashReceived ?? 0;

    if (
      params.paymentType === PaymentType.Cash &&
      capturedCash < capturedTotal
    ) {
      Alert.alert(
        "Invalid Payment",
        `Cash received (${formatPHP(capturedCash)}) is less than the total (${formatPHP(capturedTotal)}).`,
      );
      return false;
    }

    setIsSubmitting(true);

    try {
      const command: CreateTransactionCommand = {
        items: basket.map((item) => {
          if (params.paymentType === PaymentType.Credit) {
            return {
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            };
          }

          // Calculate the effective unit price after promo
          const { total } = calculateBestPromo(item, basket);
          return {
            productId: item.productId,
            quantity: item.quantity,
            // Effective Price = Discounted Total / Quantity
            unitPrice: roundTo(total / item.quantity, 2),
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
    calculateTotal,
    addToBasket,
    removeItem,
    updateQuantity,
    clearBasket,
    checkout,
    isSubmitting,
  };
}

function formatPHP(amount: number): string {
  return `₱${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

function handleApiError(err: unknown): void {
  let message = "An error occurred while processing the sale.";

  if (isAxiosError(err)) {
    const axiosError = err as AxiosError<ApiError>;
    message = axiosError.response?.data?.message ?? axiosError.message;

    if (__DEV__) {
      console.error(
        "[Checkout API Error]:",
        axiosError.response?.data || axiosError.message,
      );
    }
  }

  Alert.alert("Checkout Error", message);
}
