import type { CustomerCredit } from "@/src/types/credit";
import { UserCog, X } from "lucide-react-native";
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

interface EditCreditModalProps {
  credit: CustomerCredit | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, contact: string) => Promise<void>;
}

export function EditCreditModal({
  credit,
  isOpen,
  onClose,
  onConfirm,
}: EditCreditModalProps) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (credit) {
      setName(credit.customerName);
      setContact(credit.contactInfo || "");
    }
  }, [credit, isOpen]);

  const handleSubmit = async () => {
    if (!credit || !name.trim()) return;
    setIsSubmitting(true);
    try {
      await onConfirm(name, contact);
      onClose();
    } catch {
      // Error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <View className="items-center mb-8">
                <View className="h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 mb-4">
                  <UserCog size={28} color="#2563eb" />
                </View>
                <Text className="text-xl font-bold text-slate-900">
                  Customer Details
                </Text>
              </View>

              {/* Form */}
              <View className="space-y-5">
                <View>
                  <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1 mb-2">
                    Full Name
                  </Text>
                  <TextInput
                    className="h-12 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 text-[14px] text-slate-900 focus:bg-white"
                    placeholder="Enter customer name"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View>
                  <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1 mb-2">
                    Contact Information
                  </Text>
                  <TextInput
                    className="h-12 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 text-[14px] text-slate-900 focus:bg-white"
                    placeholder="Phone or Email"
                    value={contact}
                    onChangeText={setContact}
                    keyboardType="default"
                  />
                </View>
              </View>

              {/* Action Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting || !name.trim()}
                className={`mt-8 h-14 rounded-full items-center justify-center shadow-lg ${
                  isSubmitting || !name.trim() ? "bg-slate-300" : "bg-slate-900"
                }`}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 10,
                }}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white font-bold text-[14px]">
                    Save Changes
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
    backgroundColor: "rgba(15, 23, 42, 0.4)", // Slate-900 with opacity
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  container: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
});
