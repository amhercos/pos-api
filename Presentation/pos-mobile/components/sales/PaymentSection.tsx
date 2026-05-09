import { cn } from "@/src/lib/utils";
import { type CustomerCredit } from "@/src/types/credit";
import { PaymentType } from "@/src/types/sale";
import { CreditCard, Wallet } from "lucide-react-native";
import React, { memo } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { CreditPayment } from "./CreditPayment";

interface PaymentSectionProps {
  activePayment: PaymentType;
  setActivePayment: (p: PaymentType) => void;
  cashReceived: number;
  setCashReceived: (n: number) => void;
  credits: CustomerCredit[];
  selectedCreditId: string;
  setSelectedCreditId: (id: string) => void;
  isNewCustomer: boolean;
  setIsNewCustomer: (b: boolean) => void;
  newCustomerName: string;
  setNewCustomerName: (s: string) => void;
  newCustomerContact: string;
  setNewCustomerContact: (s: string) => void;
}

export const PaymentSection = memo(
  ({
    activePayment,
    setActivePayment,
    cashReceived,
    setCashReceived,
    ...creditProps
  }: PaymentSectionProps) => {
    return (
      <View className="px-4 pt-4">
        <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
          Payment Method
        </Text>

        {/* Compact Method Toggles */}
        <View className="flex-row gap-2 mb-4">
          {[
            { id: PaymentType.Cash, label: "Cash", icon: Wallet },
            { id: PaymentType.Credit, label: "Credit", icon: CreditCard },
          ].map((method) => {
            const isActive = activePayment === method.id;
            return (
              <TouchableOpacity
                key={method.id}
                onPress={() => setActivePayment(method.id)}
                className={cn(
                  "flex-1 h-12 rounded-xl flex-row items-center justify-center border",
                  isActive
                    ? "bg-slate-900 border-slate-900"
                    : "bg-white border-slate-200",
                )}
              >
                <method.icon size={16} color={isActive ? "white" : "#64748b"} />
                <Text
                  className={cn(
                    "ml-2 font-bold text-[11px] uppercase",
                    isActive ? "text-white" : "text-slate-500",
                  )}
                >
                  {method.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Contextual Input Area */}
        <View className="border-t border-slate-50 pt-4">
          {activePayment === PaymentType.Cash ? (
            <View className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-[10px] font-black text-slate-400 uppercase mb-1">
                  Amount Received
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-xl font-black text-slate-900 mr-1">
                    ₱
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    value={cashReceived === 0 ? "" : cashReceived.toString()}
                    onChangeText={(val) =>
                      setCashReceived(Number(val.replace(/[^0-9]/g, "")) || 0)
                    }
                    placeholder="0.00"
                    placeholderTextColor="#cbd5e1"
                    className="text-2xl font-black text-slate-900 flex-1 p-0"
                  />
                </View>
              </View>
              <Wallet size={24} color="#94a3b8" />
            </View>
          ) : (
            <CreditPayment {...creditProps} />
          )}
        </View>
      </View>
    );
  },
);

PaymentSection.displayName = "PaymentSection";
