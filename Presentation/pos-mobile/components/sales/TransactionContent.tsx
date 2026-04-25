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
    type LucideIcon,
} from "lucide-react-native";
import React, { useMemo } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TextStyle,
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
  setCashReceived: (n: number) => void;
  isSubmitting: boolean;
  handleCheckout: () => void;
  updateQuantity: (id: string, q: number) => void;
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

const inputStyle: TextStyle = {
  backgroundColor: "#f8fafc",
  padding: 16,
  borderRadius: 16,
  fontWeight: "bold",
  color: "#0f172a",
  borderWidth: 1,
  borderColor: "#e2e8f0",
};

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
    return roundTo(
      basket.reduce((sum, item) => sum + calculateLineTotal(item, basket), 0),
    );
  }, [basket]);

  const changeValue = useMemo(
    () => roundTo(Math.max(0, cashReceived - currentTotal)),
    [cashReceived, currentTotal],
  );

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
          "flex-1 flex-row items-center justify-center py-4 rounded-2xl gap-2 border",
          isActive
            ? "bg-slate-900 border-slate-900 shadow-sm"
            : "bg-white border-slate-100",
        )}
      >
        <Icon size={18} color={isActive ? "white" : "#94a3b8"} />
        <Text
          className={cn(
            "text-xs font-black uppercase tracking-tight",
            isActive ? "text-white" : "text-slate-400",
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
      <View className="flex-row items-center justify-between px-6 py-6 border-b border-slate-50 bg-white">
        <View>
          <Text className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
            Current Order
          </Text>
          <Text className="text-xl font-black text-slate-900">
            {basket.length} ITEMS
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
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 20 }}
      >
        {basket.length === 0 ? (
          <View className="items-center justify-center py-20 opacity-10">
            <ShoppingCart size={64} color="#000" />
            <Text className="font-black uppercase mt-4 text-xs">
              Empty Basket
            </Text>
          </View>
        ) : (
          basket.map((item) => (
            <View
              key={item.productId}
              className="flex-row items-center p-4 rounded-[28px] mb-3 bg-slate-50 border border-slate-100"
            >
              <View className="flex-1 pr-4">
                <Text
                  numberOfLines={1}
                  className="text-[11px] font-black uppercase text-slate-900"
                >
                  {item.name}
                </Text>
                <Text className="text-[10px] font-bold text-emerald-600 mt-1">
                  {formatPHP(calculateLineTotal(item, basket))}
                </Text>
              </View>
              <View className="flex-row items-center bg-white rounded-2xl p-1 border border-slate-100">
                <TouchableOpacity
                  onPress={() => updateQuantity(item.productId, -1)}
                  className="p-2 bg-slate-50 rounded-xl"
                >
                  <Minus size={12} color="#0f172a" />
                </TouchableOpacity>
                <Text className="font-black text-sm w-8 text-center text-slate-900">
                  {item.quantity}
                </Text>
                <TouchableOpacity
                  onPress={() => updateQuantity(item.productId, 1)}
                  className="p-2 bg-slate-50 rounded-xl"
                >
                  <Plus size={12} color="#0f172a" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View className="flex-row gap-3 mt-4 mb-6">
          <PaymentButton type={PaymentType.Cash} icon={Banknote} label="Cash" />
          <PaymentButton
            type={PaymentType.Credit}
            icon={CreditCard}
            label="Credit"
          />
        </View>

        {activePayment === PaymentType.Cash ? (
          <View>
            <Text className="text-[10px] font-black uppercase text-slate-400 mb-3 ml-1">
              Quick Cash
            </Text>
            <View className="flex-row flex-wrap justify-between gap-2 mb-6">
              {COMMON_DENOMINATIONS.map((val) => (
                <TouchableOpacity
                  key={val}
                  onPress={() => setCashReceived(val)}
                  className="bg-slate-50 border border-slate-100 h-10 rounded-xl flex-1 min-w-[30%] items-center justify-center"
                >
                  <Text className="font-black text-slate-600 text-[11px]">
                    ₱{val}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View>
            <View className="flex-row items-center gap-2 mb-4 ml-1">
              <Users size={16} color="#0f172a" />
              <Text className="text-[10px] font-black uppercase text-slate-900">
                Account Selection
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setIsNewCustomer(!isNewCustomer)}
              className={cn(
                "flex-row items-center justify-between p-4 rounded-2xl border mb-4",
                isNewCustomer
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-white border-slate-100 shadow-sm",
              )}
            >
              <View className="flex-row items-center gap-3">
                <UserPlus
                  size={20}
                  color={isNewCustomer ? "#10b981" : "#64748b"}
                />
                <Text
                  className={cn(
                    "text-xs font-black uppercase",
                    isNewCustomer ? "text-emerald-700" : "text-slate-600",
                  )}
                >
                  New Customer
                </Text>
              </View>
              <View
                className={cn(
                  "w-5 h-5 rounded-full border-2 items-center justify-center",
                  isNewCustomer
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-slate-300",
                )}
              >
                {isNewCustomer && (
                  <View className="w-2 h-2 bg-white rounded-full" />
                )}
              </View>
            </TouchableOpacity>

            {isNewCustomer ? (
              <View className="gap-3">
                <TextInput
                  placeholder="Full Name"
                  style={inputStyle}
                  value={newCustomerName}
                  onChangeText={setNewCustomerName}
                />
                <TextInput
                  placeholder="Contact Info"
                  keyboardType="default"
                  style={inputStyle}
                  value={newCustomerContact}
                  onChangeText={setNewCustomerContact}
                />
              </View>
            ) : (
              <View className="gap-2">
                {credits.map((credit) => (
                  <TouchableOpacity
                    key={credit.id}
                    onPress={() => setSelectedCreditId(credit.id)}
                    className={cn(
                      "p-4 rounded-2xl border flex-row justify-between items-center",
                      selectedCreditId === credit.id
                        ? "bg-slate-900 border-slate-900"
                        : "bg-white border-slate-100",
                    )}
                  >
                    <View>
                      <Text
                        className={cn(
                          "font-black text-[11px] uppercase",
                          selectedCreditId === credit.id
                            ? "text-white"
                            : "text-slate-900",
                        )}
                      >
                        {credit.customerName}
                      </Text>
                      <Text
                        className={cn(
                          "text-[9px] font-bold mt-0.5",
                          selectedCreditId === credit.id
                            ? "text-slate-400"
                            : "text-slate-500",
                        )}
                      >
                        DEBT: {formatPHP(credit.creditAmount)}
                      </Text>
                    </View>
                    {selectedCreditId === credit.id && (
                      <View className="bg-emerald-500 w-2.5 h-2.5 rounded-full" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <View className="bg-white border-t border-slate-100 p-6 pb-8 shadow-2xl">
        <View className="gap-3 mb-6">
          <View className="flex-row justify-between items-center">
            <Text className="text-slate-400 font-black text-[10px] uppercase tracking-widest">
              Sub-Total
            </Text>
            <Text className="text-slate-900 font-black text-xl">
              {formatPHP(currentTotal)}
            </Text>
          </View>

          {activePayment === PaymentType.Cash && (
            <>
              <View className="flex-row justify-between items-center">
                <Text className="text-slate-400 font-black text-[10px] uppercase tracking-widest">
                  Received
                </Text>
                <TextInput
                  keyboardType="numeric"
                  style={{
                    fontSize: 20,
                    fontWeight: "900",
                    color: "#10b981",
                    textAlign: "right",
                    width: 120,
                  }}
                  value={cashReceived.toString()}
                  onChangeText={(v) => setCashReceived(Number(v) || 0)}
                />
              </View>
              <View className="flex-row justify-between items-center pt-3 border-t border-slate-50">
                <Text className="text-slate-400 font-black text-[10px] uppercase tracking-widest">
                  Change
                </Text>
                <Text className="text-slate-900 font-black text-xl">
                  {formatPHP(changeValue)}
                </Text>
              </View>
            </>
          )}
        </View>

        <TouchableOpacity
          onPress={handleCheckout}
          disabled={isSubmitting || basket.length === 0}
          className={cn(
            "h-16 rounded-3xl flex-row items-center justify-center gap-3",
            basket.length === 0
              ? "bg-slate-100"
              : "bg-slate-900 shadow-lg shadow-slate-300",
          )}
        >
          {isSubmitting ? (
            <Loader2 size={24} color="white" />
          ) : (
            <>
              <Text className="text-white font-black uppercase text-sm tracking-widest">
                Complete Order
              </Text>
              <ArrowRight size={20} color="white" />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowVoidConfirm(true)}
          disabled={basket.length === 0}
          className="mt-4 py-2 items-center"
        >
          <Text
            className={cn(
              "text-[10px] font-black uppercase tracking-widest",
              basket.length === 0 ? "text-slate-200" : "text-slate-400",
            )}
          >
            Void Transaction
          </Text>
        </TouchableOpacity>
      </View>

      {showVoidConfirm && (
        <View className="absolute inset-0 bg-slate-900/95 items-center justify-center p-8 z-[100]">
          <View className="bg-white rounded-[40px] p-10 w-full items-center">
            <View className="bg-rose-50 p-6 rounded-full mb-6">
              <AlertTriangle size={40} color="#f43f5e" />
            </View>
            <Text className="text-xl font-black uppercase mb-2 text-slate-900">
              Clear Basket?
            </Text>
            <Text className="text-slate-500 text-center text-xs font-bold leading-5 mb-8">
              This will remove all items and reset the current sale progress.
            </Text>
            <TouchableOpacity
              onPress={() => {
                clearBasket();
                setShowVoidConfirm(false);
                if (!isTablet) onClose();
              }}
              className="bg-rose-500 w-full py-5 rounded-3xl mb-4"
            >
              <Text className="text-white font-black text-center uppercase tracking-widest">
                Yes, Clear All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowVoidConfirm(false)}>
              <Text className="text-slate-400 font-black uppercase text-xs tracking-tighter">
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};
