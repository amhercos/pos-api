import { formatPHP, roundTo } from "@/src/lib/math";
import {
  calculateEffectiveUnitPrice,
  calculateLineTotal,
} from "@/src/lib/pricing";
import { cn } from "@/src/lib/utils";
import { type CustomerCredit } from "@/src/types/credit";
import { PaymentType, type BasketItem } from "@/src/types/sale";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  CreditCard,
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
  UserPlus,
  Users,
  X,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const COMMON_DENOMINATIONS: number[] = [20, 50, 100, 200, 500, 1000];

interface TransactionViewProps {
  isOpen: boolean;
  onClose: () => void;
  basket: BasketItem[];
  activePayment: PaymentType;
  setActivePayment: (p: PaymentType) => void;
  cashReceived: number;
  setCashReceived: React.Dispatch<React.SetStateAction<number>>;
  isSubmitting: boolean;
  handleCheckout: () => void;
  updateQuantity: (id: string, q: number) => void;
  removeFromBasket: (id: string) => void;
  clearBasket: () => void;
  credits: CustomerCredit[];
  selectedCreditId: string;
  setSelectedCreditId: (s: string) => void;
  isNewCustomer: boolean;
  setIsNewCustomer: (b: boolean) => void;
  newCustomerName: string;
  setNewCustomerName: (s: string) => void;
  newCustomerContact: string;
  setNewCustomerContact: (s: string) => void;
}

export const TransactionModal: React.FC<TransactionViewProps> = (props) => {
  const [showVoidConfirm, setShowVoidConfirm] = useState<boolean>(false);

  // Precision-rounded total for the entire basket
  const currentTotal = useMemo<number>(() => {
    const rawTotal = props.basket.reduce((sum, item) => {
      return sum + calculateLineTotal(item, props.basket);
    }, 0);
    return roundTo(rawTotal);
  }, [props.basket]);

  // Calculate change with high precision
  const change = roundTo(Math.max(0, props.cashReceived - currentTotal));

  const handleVoidAll = (): void => {
    props.clearBasket();
    setShowVoidConfirm(false);
    props.onClose();
  };

  return (
    <Modal
      visible={props.isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={props.onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-white"
      >
        {/* HEADER */}
        <View className="flex-row items-center justify-between px-6 py-5 border-b border-slate-50">
          <View>
            <Text className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Review Order
            </Text>
            <Text className="text-lg font-black text-slate-900 uppercase">
              {props.basket.length} Items
            </Text>
          </View>
          <View className="flex-row items-center gap-4">
            {props.basket.length > 0 && (
              <TouchableOpacity onPress={() => setShowVoidConfirm(true)}>
                <Text className="text-xs font-black text-rose-500 uppercase">
                  Void
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={props.onClose}
              className="bg-slate-100 p-2 rounded-full"
            >
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 px-6 pt-4">
          {props.basket.length === 0 ? (
            <View className="items-center justify-center py-20 opacity-20">
              <ShoppingCart size={48} color="#64748b" />
              <Text className="font-black uppercase mt-4 text-xs">
                Empty Basket
              </Text>
            </View>
          ) : (
            props.basket.map((item, idx) => {
              const lineTotal = calculateLineTotal(item, props.basket);
              const effectivePrice = calculateEffectiveUnitPrice(
                item,
                props.basket,
              );
              // Use a small epsilon to avoid float precision issues in the UI
              const isPromoApplied = item.unitPrice - effectivePrice > 0.01;

              return (
                <View
                  key={item.productId}
                  className={cn(
                    "flex-row items-center p-4 rounded-3xl mb-3 border",
                    idx === 0
                      ? "bg-slate-900 border-slate-900"
                      : "bg-slate-50 border-slate-100",
                    isPromoApplied &&
                      (idx === 0
                        ? "border-emerald-400"
                        : "border-emerald-200 bg-emerald-50/50"),
                  )}
                >
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text
                        className={cn(
                          "text-[12px] font-black uppercase",
                          idx === 0 ? "text-white" : "text-slate-900",
                        )}
                      >
                        {item.name}
                      </Text>
                      {isPromoApplied && (
                        <View className="bg-emerald-500 px-2 py-0.5 rounded-full">
                          <Text className="text-[8px] font-black text-white uppercase">
                            Promo
                          </Text>
                        </View>
                      )}
                    </View>
                    <View className="flex-row items-center gap-2 mt-1">
                      <Text
                        className={cn(
                          "text-[10px] font-bold",
                          idx === 0 ? "text-emerald-400" : "text-emerald-600",
                        )}
                      >
                        {formatPHP(lineTotal)}
                      </Text>
                      {isPromoApplied && (
                        <Text className="text-[10px] font-bold line-through text-slate-400">
                          {formatPHP(item.unitPrice * item.quantity)}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View
                    className={cn(
                      "flex-row items-center rounded-2xl p-1 gap-3",
                      idx === 0 ? "bg-white/10" : "bg-slate-200/50",
                    )}
                  >
                    <TouchableOpacity
                      onPress={() => props.updateQuantity(item.productId, -1)}
                      className="p-1 bg-white rounded-xl shadow-sm"
                    >
                      <Minus size={14} color="#0f172a" />
                    </TouchableOpacity>
                    <Text
                      className={cn(
                        "font-black text-sm w-4 text-center",
                        idx === 0 ? "text-white" : "text-slate-900",
                      )}
                    >
                      {item.quantity}
                    </Text>
                    <TouchableOpacity
                      onPress={() => props.updateQuantity(item.productId, 1)}
                      className="p-1 bg-white rounded-xl shadow-sm"
                    >
                      <Plus size={14} color="#0f172a" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}

          {/* ... [CREDIT SECTION REMAINS SAME] ... */}
          {props.activePayment === PaymentType.Credit && (
            <View className="mt-4 mb-8">
              <View className="flex-row bg-slate-100 p-1 rounded-2xl mb-4">
                <TouchableOpacity
                  onPress={() => props.setIsNewCustomer(false)}
                  className={cn(
                    "flex-1 flex-row items-center justify-center py-2 rounded-xl gap-2",
                    !props.isNewCustomer ? "bg-white shadow-sm" : "",
                  )}
                >
                  <Users
                    size={14}
                    color={!props.isNewCustomer ? "#0f172a" : "#94a3b8"}
                  />
                  <Text
                    className={cn(
                      "text-[10px] font-black uppercase",
                      !props.isNewCustomer
                        ? "text-slate-900"
                        : "text-slate-400",
                    )}
                  >
                    Existing
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => props.setIsNewCustomer(true)}
                  className={cn(
                    "flex-1 flex-row items-center justify-center py-2 rounded-xl gap-2",
                    props.isNewCustomer ? "bg-white shadow-sm" : "",
                  )}
                >
                  <UserPlus
                    size={14}
                    color={props.isNewCustomer ? "#0f172a" : "#94a3b8"}
                  />
                  <Text
                    className={cn(
                      "text-[10px] font-black uppercase",
                      props.isNewCustomer ? "text-slate-900" : "text-slate-400",
                    )}
                  >
                    New
                  </Text>
                </TouchableOpacity>
              </View>

              {props.isNewCustomer ? (
                <View className="gap-3">
                  <TextInput
                    className="bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-slate-900"
                    placeholder="CUSTOMER NAME"
                    value={props.newCustomerName}
                    onChangeText={props.setNewCustomerName}
                  />
                  <TextInput
                    className="bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-slate-900"
                    placeholder="CONTACT NUMBER"
                    keyboardType="phone-pad"
                    value={props.newCustomerContact}
                    onChangeText={props.setNewCustomerContact}
                  />
                </View>
              ) : (
                <View className="bg-slate-50 rounded-3xl p-2 border border-slate-100">
                  {props.credits.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      onPress={() => props.setSelectedCreditId(c.id)}
                      className={cn(
                        "p-4 rounded-2xl mb-1 flex-row justify-between items-center",
                        props.selectedCreditId === c.id ? "bg-slate-900" : "",
                      )}
                    >
                      <Text
                        className={cn(
                          "font-black text-[10px] uppercase",
                          props.selectedCreditId === c.id
                            ? "text-white"
                            : "text-slate-900",
                        )}
                      >
                        {c.customerName}
                      </Text>
                      <Text
                        className={cn(
                          "font-bold text-[10px]",
                          props.selectedCreditId === c.id
                            ? "text-slate-400"
                            : "text-slate-500",
                        )}
                      >
                        {formatPHP(c.creditAmount)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* PAYMENT SUMMARY */}
        <View className="bg-white border-t border-slate-100 p-6 pb-10 shadow-2xl">
          {/* Payment Toggle */}
          <View className="flex-row bg-slate-100 p-1.5 rounded-2xl mb-6">
            <TouchableOpacity
              onPress={() => props.setActivePayment(PaymentType.Cash)}
              className={cn(
                "flex-1 flex-row items-center justify-center py-3 rounded-xl gap-2",
                props.activePayment === PaymentType.Cash
                  ? "bg-white shadow-sm"
                  : "",
              )}
            >
              <Banknote
                size={16}
                color={
                  props.activePayment === PaymentType.Cash
                    ? "#0f172a"
                    : "#94a3b8"
                }
              />
              <Text
                className={cn(
                  "text-[10px] font-black uppercase",
                  props.activePayment === PaymentType.Cash
                    ? "text-slate-900"
                    : "text-slate-400",
                )}
              >
                Cash
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => props.setActivePayment(PaymentType.Credit)}
              className={cn(
                "flex-1 flex-row items-center justify-center py-3 rounded-xl gap-2",
                props.activePayment === PaymentType.Credit
                  ? "bg-white shadow-sm"
                  : "",
              )}
            >
              <CreditCard
                size={16}
                color={
                  props.activePayment === PaymentType.Credit
                    ? "#0f172a"
                    : "#94a3b8"
                }
              />
              <Text
                className={cn(
                  "text-[10px] font-black uppercase",
                  props.activePayment === PaymentType.Credit
                    ? "text-slate-900"
                    : "text-slate-400",
                )}
              >
                Credit
              </Text>
            </TouchableOpacity>
          </View>

          {/* Cash Input / Denominations */}
          {props.activePayment === PaymentType.Cash && (
            <View className="mb-6">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-4"
              >
                {COMMON_DENOMINATIONS.map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    onPress={() =>
                      props.setCashReceived((prev) =>
                        roundTo((prev || 0) + amt),
                      )
                    }
                    className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl mr-2"
                  >
                    <Text className="text-[10px] font-black text-slate-900">
                      +{amt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View className="bg-slate-50 rounded-3xl p-4 flex-row items-center justify-between border border-slate-100">
                <Text className="text-xl font-black text-slate-300">₱</Text>
                <TextInput
                  keyboardType="numeric"
                  className="text-3xl font-black text-slate-900 text-right flex-1"
                  value={
                    props.cashReceived === 0
                      ? ""
                      : props.cashReceived.toString()
                  }
                  onChangeText={(v) =>
                    props.setCashReceived(v === "" ? 0 : Number(v))
                  }
                />
              </View>
            </View>
          )}

          <View className="flex-row items-end justify-between mb-6 px-1">
            <View>
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Grand Total
              </Text>
              <Text className="text-4xl font-black text-slate-900">
                {formatPHP(currentTotal)}
              </Text>
            </View>
            {props.activePayment === PaymentType.Cash && change > 0 && (
              <View className="items-end">
                <Text className="text-[10px] font-black text-emerald-500 uppercase">
                  Change Due
                </Text>
                <Text className="text-lg font-black text-emerald-600">
                  {formatPHP(change)}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            disabled={
              props.isSubmitting ||
              props.basket.length === 0 ||
              (props.activePayment === PaymentType.Cash &&
                roundTo(props.cashReceived) < currentTotal)
            }
            onPress={props.handleCheckout}
            className={cn(
              "h-16 rounded-3xl flex-row items-center justify-between px-8 shadow-xl",
              props.isSubmitting ||
                props.basket.length === 0 ||
                (props.activePayment === PaymentType.Cash &&
                  roundTo(props.cashReceived) < currentTotal)
                ? "bg-slate-200"
                : "bg-slate-900",
            )}
          >
            {props.isSubmitting ? (
              <Loader2
                size={24}
                color="white"
                className="animate-spin mx-auto"
              />
            ) : (
              <>
                <Text className="text-white font-black uppercase text-xs tracking-widest">
                  Complete Sale
                </Text>
                <ArrowRight size={20} color="white" opacity={0.5} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* VOID MODAL REMAINS SAME */}
        <Modal visible={showVoidConfirm} transparent animationType="fade">
          <View className="flex-1 bg-black/60 items-center justify-center p-6">
            <View className="bg-white w-full rounded-[3rem] p-8 items-center shadow-2xl">
              <View className="bg-rose-50 p-5 rounded-full mb-4">
                <AlertTriangle size={32} color="#f43f5e" />
              </View>
              <Text className="text-xl font-black text-slate-900 uppercase">
                Void All?
              </Text>
              <Text className="text-slate-400 font-bold text-center mt-2 mb-8 text-xs uppercase tracking-tight">
                This will remove all items from the current transaction.
              </Text>
              <TouchableOpacity
                onPress={handleVoidAll}
                className="bg-rose-500 w-full py-4 rounded-2xl mb-3"
              >
                <Text className="text-white text-center font-black uppercase text-xs">
                  Clear Everything
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowVoidConfirm(false)}
                className="py-2"
              >
                <Text className="text-slate-400 font-black uppercase text-xs">
                  Go Back
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </Modal>
  );
};
