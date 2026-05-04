import { cn } from "@/src/lib/utils";
import { type CustomerCredit } from "@/src/types/credit";
import { Check } from "lucide-react-native";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

interface CreditPaymentProps {
  credits: CustomerCredit[];
  selectedCreditId: string;
  setSelectedCreditId: (id: string) => void;
  isNewCustomer: boolean;
  setIsNewCustomer: (b: boolean) => void;
  newCustomerName: string;
  setNewCustomerName: (s: string) => void;
  newCustomerContact: string; // Added property
  setNewCustomerContact: (s: string) => void; // Added property
}

export const CreditPayment = ({
  credits,
  selectedCreditId,
  setSelectedCreditId,
  isNewCustomer,
  setIsNewCustomer,
  newCustomerName,
  setNewCustomerName,
  newCustomerContact,
  setNewCustomerContact,
}: CreditPaymentProps) => {
  return (
    <View className="gap-4">
      <TouchableOpacity
        onPress={() => setIsNewCustomer(!isNewCustomer)}
        className="flex-row items-center gap-2 mb-2"
      >
        <View
          className={cn(
            "w-5 h-5 rounded border items-center justify-center",
            isNewCustomer
              ? "bg-slate-900 border-slate-900"
              : "border-slate-300",
          )}
        >
          {isNewCustomer && <Check size={12} color="white" />}
        </View>
        <Text className="text-xs font-bold text-slate-600">
          New Customer Credit
        </Text>
      </TouchableOpacity>

      {isNewCustomer ? (
        <View className="gap-3">
          <TextInput
            placeholder="Enter Customer Name"
            value={newCustomerName}
            onChangeText={setNewCustomerName}
            className="h-14 bg-slate-50 rounded-2xl px-4 font-bold border border-slate-100"
          />
          <TextInput
            placeholder="Enter Contact Number"
            value={newCustomerContact}
            onChangeText={setNewCustomerContact}
            keyboardType="phone-pad"
            className="h-14 bg-slate-50 rounded-2xl px-4 font-bold border border-slate-100"
          />
        </View>
      ) : (
        <View className="gap-2">
          {credits.map((c) => (
            <TouchableOpacity
              key={c.id}
              onPress={() => setSelectedCreditId(c.id)}
              className={cn(
                "h-14 rounded-2xl px-4 flex-row items-center border",
                selectedCreditId === c.id
                  ? "bg-slate-900 border-slate-900"
                  : "bg-white border-slate-100",
              )}
            >
              <View className="flex-1">
                <Text
                  className={cn(
                    "font-bold",
                    selectedCreditId === c.id ? "text-white" : "text-slate-700",
                  )}
                >
                  {c.customerName}
                </Text>
                {c.contactInfo && (
                  <Text
                    className={cn(
                      "text-[10px]",
                      selectedCreditId === c.id
                        ? "text-slate-300"
                        : "text-slate-400",
                    )}
                  >
                    {c.contactInfo}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
          {credits.length === 0 && (
            <Text className="text-center text-slate-400 text-xs italic py-4">
              No existing credits found.
            </Text>
          )}
        </View>
      )}
    </View>
  );
};
