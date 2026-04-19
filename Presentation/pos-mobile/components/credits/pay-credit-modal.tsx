import type { CustomerCredit } from "@/src/types/credit";
import { Wallet, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

interface PayCreditModalProps {
  credit: CustomerCredit | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amountPaid: number) => Promise<void>;
}

export function PayCreditModal({
  credit,
  isOpen,
  onClose,
  onConfirm,
}: PayCreditModalProps) {
  const [amountPaid, setAmountPaid] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset input when modal closes
  useEffect(() => {
    if (!isOpen) setAmountPaid("");
  }, [isOpen]);

  const handleSubmit = async () => {
    const numAmount = Number(amountPaid);
    if (!credit || numAmount <= 0) return;

    setIsSubmitting(true);
    try {
      await onConfirm(numAmount);
      onClose();
    } catch {
      // Error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOverpaying = credit
    ? Number(amountPaid) > credit.creditAmount
    : false;

  const formatPHP = (val: number) =>
    `₱${val.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
          >
            <View className="bg-white rounded-[32px] p-8 w-full shadow-2xl relative">
              {/* Close Button */}
              <TouchableOpacity
                onPress={onClose}
                className="absolute right-6 top-6 p-2 z-10"
              >
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>

              {/* Header */}
              <View className="items-center mb-6">
                <View className="h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 mb-4">
                  <Wallet size={28} color="#10b981" />
                </View>
                <Text className="text-xl font-bold text-slate-900">
                  Record Payment
                </Text>
              </View>

              {/* Input Section */}
              <View className="mb-8">
                <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 mb-2">
                  Payment for {credit?.customerName}
                </Text>

                <View
                  className={`flex-row items-center h-14 rounded-2xl border px-4 bg-slate-50/50 ${
                    isOverpaying ? "border-amber-500" : "border-slate-100"
                  }`}
                >
                  <Text className="text-lg font-bold text-slate-400 mr-2">
                    ₱
                  </Text>
                  <TextInput
                    className="flex-1 text-lg font-bold text-slate-900"
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    value={amountPaid}
                    onChangeText={setAmountPaid}
                    autoFocus
                  />
                </View>

                {credit && (
                  <View className="flex-row justify-between mt-3 px-1">
                    <Text className="text-[11px] text-slate-400 italic">
                      Balance: {formatPHP(credit.creditAmount)}
                    </Text>
                    {isOverpaying && (
                      <Text className="text-[11px] font-bold text-amber-600 uppercase">
                        Overpayment
                      </Text>
                    )}
                  </View>
                )}
              </View>

              {/* Action Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={
                  isSubmitting || !amountPaid || Number(amountPaid) <= 0
                }
                className={`h-14 rounded-full items-center justify-center shadow-lg ${
                  isSubmitting || !amountPaid || Number(amountPaid) <= 0
                    ? "bg-slate-200"
                    : "bg-emerald-600"
                }`}
                style={
                  !isSubmitting && amountPaid
                    ? {
                        shadowColor: "#10b981",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 10,
                      }
                    : {}
                }
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white font-bold text-[14px]">
                    Confirm{" "}
                    {amountPaid ? formatPHP(Number(amountPaid)) : "₱0.00"}{" "}
                    Payment
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  container: {
    width: "100%",
    maxWidth: 400,
  },
});
