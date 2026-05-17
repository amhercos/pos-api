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
import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { calculateLineTotal } from "../utils/promotion-engine";

export function useSale() {
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Real-time calculation engine cache memoized
  const totals = useMemo(() => {
    let originalTotalAmount = 0;
    let cashDiscountedAmount = 0;
    const appliedNames: string[] = [];

    basket.forEach((item) => {
      const lineCalculations = calculateLineTotal(item, basket);
      originalTotalAmount += lineCalculations.originalTotal;
      cashDiscountedAmount += lineCalculations.discountedTotal;

      if (lineCalculations.appliedPromotionName) {
        appliedNames.push(lineCalculations.appliedPromotionName);
      }
    });

    const creditTotalAmount = basket.reduce(
      (acc, item) => acc + item.unitPrice * item.quantity,
      0,
    );

    return {
      originalTotal: roundTo(originalTotalAmount, 2),
      cashTotal: roundTo(cashDiscountedAmount, 2),
      creditTotal: roundTo(creditTotalAmount, 2),
      savings: roundTo(
        Math.max(0, originalTotalAmount - cashDiscountedAmount),
        2,
      ),
      promotionsApplied: Array.from(new Set(appliedNames)).join(", ") || null,
    };
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

  const removeItem = useCallback((productId: string): void => {
    setBasket((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

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

    // No promotions applied if payment type is Credit
    const isCredit = params.paymentType === PaymentType.Credit;
    const capturedTotal = isCredit ? totals.creditTotal : totals.cashTotal;
    const capturedCash = params.cashReceived ?? 0;

    if (!isCredit && capturedCash < capturedTotal) {
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
          if (isCredit) {
            return {
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            };
          }

          const { discountedTotal } = calculateLineTotal(item, basket);
          return {
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: roundTo(discountedTotal / item.quantity, 2),
          };
        }),
        paymentType: params.paymentType,
        totalAmount: capturedTotal,
        cashReceived: roundTo(capturedCash, 2),
        changeAmount: !isCredit
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
    totals,
    addToBasket,
    removeItem,
    updateQuantity,
    clearBasket,
    checkout,
    isSubmitting,
  };
}

// Global utility formatting helpers
function formatPHP(amount: number): string {
  return `₱${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

function handleApiError(err: unknown): void {
  let message = "An error occurred while processing the sale.";
  if (isAxiosError(err)) {
    const axiosError = err as AxiosError<ApiError>;
    message = axiosError.response?.data?.message || axiosError.message;
  }
  Alert.alert("Checkout Error", message);
}
