import { usePromotions } from "@/src/hooks/use-promotions";
import { type CustomerCredit } from "@/src/types/credit";
import { PromotionCalculationResponse } from "@/src/types/promotion";
import { PaymentType, type BasketItem } from "@/src/types/sale";
import { CheckCircle2, RotateCcw, X } from "lucide-react-native";
import React, {
  Dispatch,
  memo,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { formatPHP } from "@/src/lib/math";
import { cn } from "@/src/lib/utils";
import { BillDetails } from "./BillDetails";
import { OrderSummary } from "./OrderSummary";
import { PaymentSection } from "./PaymentSection";

const QUICK_CASH = [20, 50, 100, 200, 500, 1000];

interface TransactionContentProps {
  basket: BasketItem[];
  activePayment: PaymentType;
  setActivePayment: (p: PaymentType) => void;
  cashReceived: number;
  setCashReceived: Dispatch<SetStateAction<number>>;
  handleCheckout: () => void;
  clearBasket: () => void;
  onClose: () => void;
  updateQuantity: (id: string, q: number) => void;
  removeItem: (id: string) => void;
  credits: CustomerCredit[];
  selectedCreditId: string;
  setSelectedCreditId: (s: string) => void;
  isNewCustomer: boolean;
  setIsNewCustomer: (b: boolean) => void;
  newCustomerName: string;
  setNewCustomerName: (s: string) => void;
  newCustomerContact: string;
  setNewCustomerContact: (s: string) => void;
  isSubmitting: boolean;
  isTablet?: boolean;
}

export const TransactionContent = memo<TransactionContentProps>(
  ({
    basket,
    activePayment,
    setActivePayment,
    cashReceived,
    setCashReceived,
    handleCheckout,
    clearBasket,
    onClose,
    updateQuantity,
    credits,
    selectedCreditId,
    setSelectedCreditId,
    isNewCustomer,
    setIsNewCustomer,
    newCustomerName,
    setNewCustomerName,
    newCustomerContact,
    setNewCustomerContact,
    isSubmitting,
    isTablet = false,
  }) => {
    const { calculatePrice } = usePromotions();
    const [isCalculating, setIsCalculating] = useState<boolean>(false);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const [calcResult, setCalcResult] = useState<PromotionCalculationResponse>({
      originalTotal: 0,
      discountedTotal: 0,
      savings: 0,
      appliedPromotionName: null,
    });

    useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: isCalculating ? 0.6 : 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }, [isCalculating, fadeAnim]);

    const syncPricing = useCallback(async () => {
      if (basket.length === 0) {
        setCalcResult({
          originalTotal: 0,
          discountedTotal: 0,
          savings: 0,
          appliedPromotionName: null,
        });
        return;
      }

      setIsCalculating(true);
      try {
        const results = await Promise.all(
          basket.map(async (item: BasketItem) => {
            try {
              const r = await calculatePrice({
                productId: item.productId,
                quantity: item.quantity,
              });
              return {
                originalTotal:
                  Number(r?.originalTotal) || item.unitPrice * item.quantity,
                discountedTotal:
                  Number(r?.discountedTotal) || item.unitPrice * item.quantity,
                appliedPromotionName: r?.appliedPromotionName ?? null,
              };
            } catch {
              const fallback = item.unitPrice * item.quantity;
              return {
                originalTotal: fallback,
                discountedTotal: fallback,
                appliedPromotionName: null,
              };
            }
          }),
        );

        const totalOriginal = results.reduce(
          (sum, r) => sum + r.originalTotal,
          0,
        );
        const totalDiscounted = results.reduce(
          (sum, r) => sum + r.discountedTotal,
          0,
        );
        const promoNames = results
          .map((r) => r.appliedPromotionName)
          .filter((n): n is string => n !== null);

        setCalcResult({
          originalTotal: totalOriginal,
          discountedTotal: totalDiscounted,
          savings: Math.max(0, totalOriginal - totalDiscounted),
          appliedPromotionName:
            promoNames.length > 0
              ? Array.from(new Set(promoNames)).join(", ")
              : null,
        });
      } finally {
        setIsCalculating(false);
      }
    }, [basket, calculatePrice]);

    useEffect(() => {
      syncPricing();
    }, [syncPricing]);

    const changeAmount = useMemo(
      () => cashReceived - calcResult.discountedTotal,
      [cashReceived, calcResult.discountedTotal],
    );

    const isCheckoutDisabled = useMemo(
      () =>
        isSubmitting ||
        isCalculating ||
        basket.length === 0 ||
        (activePayment === PaymentType.Cash &&
          (cashReceived === 0 || changeAmount < 0)) ||
        (activePayment === PaymentType.Credit &&
          !isNewCustomer &&
          !selectedCreditId) ||
        (activePayment === PaymentType.Credit &&
          isNewCustomer &&
          !newCustomerName),
      [
        isSubmitting,
        isCalculating,
        basket.length,
        activePayment,
        cashReceived,
        changeAmount,
        isNewCustomer,
        selectedCreditId,
        newCustomerName,
      ],
    );

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Header */}
        <View className="h-20 flex-row items-center px-6 border-b border-slate-100">
          <TouchableOpacity
            onPress={onClose}
            className="w-10 h-10 items-center justify-center rounded-full bg-slate-50"
          >
            <X size={20} color="#64748b" />
          </TouchableOpacity>

          <View className="flex-1 ml-4">
            <Text className="text-lg font-black text-slate-900 uppercase tracking-tighter">
              Checkout
            </Text>
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {basket.length} {basket.length === 1 ? "Item" : "Items"} in Basket
            </Text>
          </View>

          <TouchableOpacity
            onPress={clearBasket}
            className="flex-row items-center bg-rose-50 px-4 py-2 rounded-xl"
          >
            <RotateCcw size={14} color="#ef4444" className="mr-2" />
            <Text className="text-rose-500 font-black text-[11px] uppercase">
              Reset
            </Text>
          </TouchableOpacity>
        </View>

        <View className={cn("flex-1", isTablet ? "flex-row" : "flex-column")}>
          <View
            className={cn("bg-slate-50/50", isTablet ? "flex-[0.6]" : "flex-1")}
          >
            <OrderSummary basket={basket} updateQuantity={updateQuantity} />
          </View>

          <View
            className={cn(
              "bg-white border-slate-100",
              isTablet ? "flex-[0.4] border-l" : "flex-[1.2]",
            )}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
            >
              <PaymentSection
                activePayment={activePayment}
                setActivePayment={setActivePayment}
                cashReceived={cashReceived}
                setCashReceived={setCashReceived}
                credits={credits}
                selectedCreditId={selectedCreditId}
                setSelectedCreditId={setSelectedCreditId}
                isNewCustomer={isNewCustomer}
                setIsNewCustomer={setIsNewCustomer}
                newCustomerName={newCustomerName}
                setNewCustomerName={setNewCustomerName}
                newCustomerContact={newCustomerContact}
                setNewCustomerContact={setNewCustomerContact}
              />

              {/* Improved Quick Cash Section */}
              {activePayment === PaymentType.Cash && (
                <View className="px-5 mt-2">
                  <View className="bg-slate-50/80 p-4 rounded-3xl border border-dashed border-slate-200">
                    <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">
                      Quick Denominations
                    </Text>
                    <View className="flex-row flex-wrap justify-between gap-y-2">
                      {QUICK_CASH.map((val) => (
                        <TouchableOpacity
                          key={val}
                          onPress={() =>
                            setCashReceived(
                              (prev) =>
                                (typeof prev === "number" ? prev : 0) + val,
                            )
                          }
                          className="w-[31%] py-3 rounded-xl bg-white border border-slate-100 items-center justify-center shadow-sm active:bg-slate-100"
                        >
                          <Text className="text-slate-700 font-black text-xs">
                            +₱{val}
                          </Text>
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity
                        onPress={() => setCashReceived(0)}
                        className="w-[31%] py-3 rounded-xl bg-rose-50 border border-rose-100 items-center justify-center"
                      >
                        <Text className="text-rose-500 font-black text-[10px] uppercase">
                          Clear
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              <View className="h-[1px] bg-slate-100 mx-5 my-6" />

              <Animated.View style={{ opacity: fadeAnim }}>
                <BillDetails
                  calcResult={calcResult}
                  isCalculating={isCalculating}
                />
              </Animated.View>
            </ScrollView>
          </View>
        </View>

        {/* Unified Sticky Checkout Button */}
        <View className="p-6 border-t border-slate-100 bg-white">
          <TouchableOpacity
            onPress={handleCheckout}
            disabled={isCheckoutDisabled}
            className={cn(
              "h-16 rounded-2xl flex-row items-center justify-center shadow-lg shadow-slate-200",
              isCheckoutDisabled ? "bg-slate-200" : "bg-slate-900",
            )}
          >
            <CheckCircle2 size={20} color="white" className="mr-3" />
            <Text className="text-white font-black text-base uppercase tracking-widest">
              {isSubmitting
                ? "Finalizing..."
                : `Submit Transaction • ${formatPHP(calcResult.discountedTotal)}`}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  },
);

TransactionContent.displayName = "TransactionContent";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  scrollContent: { paddingBottom: 40 },
});
