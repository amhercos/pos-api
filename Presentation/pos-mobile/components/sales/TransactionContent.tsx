import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  CreditCard,
  Loader2,
  Minus,
  Plus,
  Trash2,
  UserPlus,
  Users,
  X,
  type LucideIcon,
} from "lucide-react-native";
import React, { useMemo } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { formatPHP, roundTo } from "@/src/lib/math";
import { calculateLineTotal } from "@/src/lib/pricing";
import { cn } from "@/src/lib/utils";
import { type CustomerCredit } from "@/src/types/credit";
import { PaymentType, type BasketItem } from "@/src/types/sale";

const COMMON_DENOMINATIONS: number[] = [20, 50, 100, 200, 500, 1000];

interface TransactionContentProps {
  isTablet: boolean;
  onClose: () => void;
  basket: BasketItem[];
  activePayment: PaymentType;
  setActivePayment: (p: PaymentType) => void;
  cashReceived: number;
  setCashReceived: React.Dispatch<React.SetStateAction<number>>;
  isSubmitting: boolean;
  handleCheckout: () => void;
  updateQuantity: (id: string, q: number) => void;
  removeItem: (id: string) => void;
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
  showVoidConfirm: boolean;
  setShowVoidConfirm: (b: boolean) => void;
}

export const TransactionContent: React.FC<TransactionContentProps> = ({
  isTablet,
  onClose,
  basket,
  activePayment,
  setActivePayment,
  cashReceived,
  setCashReceived,
  isSubmitting,
  handleCheckout,
  updateQuantity,
  removeItem,
  clearBasket,
  credits = [],
  selectedCreditId,
  setSelectedCreditId,
  isNewCustomer,
  setIsNewCustomer,
  newCustomerName,
  setNewCustomerName,
  newCustomerContact,
  setNewCustomerContact,
  showVoidConfirm,
  setShowVoidConfirm,
}) => {
  const currentTotal = useMemo(() => {
    const total = basket.reduce((sum, item) => {
      if (activePayment === PaymentType.Credit) {
        return sum + item.unitPrice * item.quantity;
      }
      return sum + calculateLineTotal(item, basket);
    }, 0);
    return roundTo(total);
  }, [basket, activePayment]);

  const changeValue = useMemo(
    () => roundTo(Math.max(0, cashReceived - currentTotal)),
    [cashReceived, currentTotal],
  );

  const addQuickCash = (val: number) => {
    setCashReceived((prev) => prev + val);
  };

  const PaymentButton = ({
    type,
    icon: Icon,
    label,
  }: {
    type: PaymentType;
    icon: LucideIcon;
    label: string;
  }) => {
    const isActive = activePayment === type;
    return (
      <TouchableOpacity
        onPress={() => setActivePayment(type)}
        className={cn(
          "flex-1 flex-row items-center justify-center py-4 rounded-2xl gap-3",
          isActive ? "bg-slate-900 shadow-lg shadow-slate-400" : "bg-slate-50",
        )}
      >
        <Icon size={18} color={isActive ? "white" : "#64748b"} />
        <Text
          className={cn(
            "text-[10px] font-black uppercase tracking-[1px]",
            isActive ? "text-white" : "text-slate-500",
          )}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white"
    >
      <View className="flex-row items-center justify-between px-6 py-5">
        <View>
          <Text className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
            Checkout
          </Text>
          <Text className="text-xl font-black text-slate-900">
            {basket.length} {basket.length === 1 ? "Item" : "Items"}
          </Text>
        </View>
        {!isTablet && (
          <TouchableOpacity
            onPress={onClose}
            className="bg-slate-100 p-2.5 rounded-full"
          >
            <X size={20} color="#64748b" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24 }}
      >
        {/* Basket List */}
        <View className="mb-6">
          {basket.map((item) => (
            <View
              key={item.productId}
              className="flex-row items-center py-4 border-b border-slate-50"
            >
              <View className="flex-1">
                <Text className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                  {item.name}
                </Text>
                <Text className="text-[11px] font-black text-emerald-600 mt-0.5">
                  {activePayment === PaymentType.Credit
                    ? formatPHP(item.unitPrice * item.quantity)
                    : formatPHP(calculateLineTotal(item, basket))}
                </Text>
              </View>

              <View className="flex-row items-center bg-slate-50 rounded-xl px-1 py-1">
                <TouchableOpacity
                  onPress={() =>
                    item.quantity > 1
                      ? updateQuantity(item.productId, -1)
                      : removeItem(item.productId)
                  }
                  className="p-1.5"
                >
                  {item.quantity > 1 ? (
                    <Minus size={12} color="#475569" />
                  ) : (
                    <Trash2 size={12} color="#ef4444" />
                  )}
                </TouchableOpacity>
                <Text className="font-black text-xs w-6 text-center text-slate-900">
                  {item.quantity}
                </Text>
                <TouchableOpacity
                  onPress={() => updateQuantity(item.productId, 1)}
                  className="p-1.5"
                >
                  <Plus size={12} color="#475569" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Payment Methods */}
        <View className="flex-row gap-3 mb-8">
          <PaymentButton type={PaymentType.Cash} icon={Banknote} label="Cash" />
          <PaymentButton
            type={PaymentType.Credit}
            icon={CreditCard}
            label="Credit"
          />
        </View>

        {activePayment === PaymentType.Cash ? (
          <View className="mb-8">
            <Text className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">
              Quick Cash
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {COMMON_DENOMINATIONS.map((val) => (
                <TouchableOpacity
                  key={val}
                  onPress={() => addQuickCash(val)}
                  className="bg-white shadow-sm border border-slate-100 h-12 rounded-xl flex-1 min-w-[28%] items-center justify-center active:bg-slate-50"
                >
                  <Text className="font-black text-slate-700 text-xs">
                    +₱{val}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          /* CREDIT SECTION */
          <View className="mb-8">
            <View className="flex-row gap-2 mb-6">
              <TouchableOpacity
                onPress={() => setIsNewCustomer(false)}
                className={cn(
                  "flex-1 py-3 rounded-xl flex-row items-center justify-center gap-2",
                  !isNewCustomer
                    ? "bg-slate-100"
                    : "bg-white border border-slate-50",
                )}
              >
                <Users
                  size={14}
                  color={!isNewCustomer ? "#0f172a" : "#94a3b8"}
                />
                <Text
                  className={cn(
                    "text-[10px] font-black uppercase",
                    !isNewCustomer ? "text-slate-900" : "text-slate-400",
                  )}
                >
                  Existing
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsNewCustomer(true)}
                className={cn(
                  "flex-1 py-3 rounded-xl flex-row items-center justify-center gap-2",
                  isNewCustomer
                    ? "bg-slate-100"
                    : "bg-white border border-slate-50",
                )}
              >
                <UserPlus
                  size={14}
                  color={isNewCustomer ? "#0f172a" : "#94a3b8"}
                />
                <Text
                  className={cn(
                    "text-[10px] font-black uppercase",
                    isNewCustomer ? "text-slate-900" : "text-slate-400",
                  )}
                >
                  New
                </Text>
              </TouchableOpacity>
            </View>

            {isNewCustomer ? (
              <View className="gap-3">
                <TextInput
                  placeholder="Customer Full Name"
                  className="bg-slate-50 p-4 rounded-2xl font-bold text-slate-900"
                  value={newCustomerName}
                  onChangeText={setNewCustomerName}
                />
                <TextInput
                  placeholder="Contact Number (Optional)"
                  keyboardType="phone-pad"
                  className="bg-slate-50 p-4 rounded-2xl font-bold text-slate-900"
                  value={newCustomerContact}
                  onChangeText={setNewCustomerContact}
                />
              </View>
            ) : (
              <View className="gap-2">
                <Text className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-1">
                  Select Account
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="flex-row"
                >
                  {credits.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      onPress={() => setSelectedCreditId(c.id)}
                      className={cn(
                        "mr-2 px-5 py-4 rounded-2xl border min-w-[120px]",
                        selectedCreditId === c.id
                          ? "bg-slate-900 border-slate-900"
                          : "bg-white border-slate-100",
                      )}
                    >
                      <Text
                        className={cn(
                          "font-black text-xs",
                          selectedCreditId === c.id
                            ? "text-white"
                            : "text-slate-800",
                        )}
                      >
                        {c.customerName}
                      </Text>
                      <Text
                        className={cn(
                          "text-[9px] font-bold mt-1",
                          selectedCreditId === c.id
                            ? "text-slate-400"
                            : "text-slate-400",
                        )}
                      >
                        Balance: {formatPHP(c.creditAmount)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Footer / Summary */}
      <View className="p-6 pb-10 bg-white border-t border-slate-50">
        <View className="flex-row justify-between items-end mb-6">
          <View>
            <Text className="text-[10px] font-black uppercase text-slate-400 tracking-[1px]">
              Total Due
            </Text>
            <Text className="text-3xl font-black text-slate-900">
              {formatPHP(currentTotal)}
            </Text>
          </View>

          {activePayment === PaymentType.Cash && (
            <View className="items-end">
              <Text className="text-[10px] font-black uppercase text-slate-400 tracking-[1px]">
                Change
              </Text>
              <Text className="text-xl font-black text-emerald-600">
                {formatPHP(changeValue)}
              </Text>
            </View>
          )}
        </View>

        {activePayment === PaymentType.Cash && (
          <View className="bg-slate-50 rounded-2xl p-4 flex-row items-center justify-between mb-4">
            <Text className="text-xs font-bold text-slate-500">
              Amount Received
            </Text>
            <View className="flex-row items-center">
              <Text className="text-lg font-black text-slate-900 mr-2">₱</Text>
              <TextInput
                keyboardType="numeric"
                placeholder="0"
                value={cashReceived === 0 ? "" : cashReceived.toString()}
                onChangeText={(v) => setCashReceived(Number(v) || 0)}
                className="text-lg font-black text-slate-900 w-24 text-right"
              />
            </View>
          </View>
        )}

        <TouchableOpacity
          onPress={handleCheckout}
          disabled={isSubmitting || basket.length === 0}
          className={cn(
            "h-16 rounded-2xl flex-row items-center justify-center gap-3",
            basket.length === 0
              ? "bg-slate-100"
              : "bg-slate-900 shadow-xl shadow-slate-300",
          )}
        >
          {isSubmitting ? (
            <Loader2 size={20} color="white" className="animate-spin" />
          ) : (
            <>
              <Text className="text-white font-black uppercase text-xs tracking-widest">
                {activePayment === PaymentType.Credit
                  ? "Charge to Credit"
                  : "Complete Sale"}
              </Text>
              <ArrowRight size={18} color="white" />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowVoidConfirm(true)}
          className="mt-4 self-center"
        >
          <Text className="text-[9px] font-black uppercase text-slate-600 tracking-[2px]">
            Void Transaction
          </Text>
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal Logic (Keep the existing one) */}
      {showVoidConfirm && (
        <View className="absolute inset-0 bg-slate-900/90 items-center justify-center p-8 z-[100]">
          <View className="bg-white rounded-[40px] p-8 w-full items-center shadow-2xl">
            <AlertTriangle size={40} color="#f43f5e" />
            <Text className="text-xl font-black text-slate-900 mt-4 mb-2">
              Void Transaction?
            </Text>
            <Text className="text-slate-400 text-center text-xs mb-8">
              This will clear the current basket.
            </Text>
            <TouchableOpacity
              onPress={() => {
                clearBasket();
                setShowVoidConfirm(false);
                if (!isTablet) onClose();
              }}
              className="bg-rose-500 w-full py-4 rounded-2xl mb-3"
            >
              <Text className="text-white font-black text-center uppercase tracking-widest text-xs">
                Confirm Void
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowVoidConfirm(false)}>
              <Text className="text-slate-400 font-black uppercase text-[10px] tracking-widest">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};
