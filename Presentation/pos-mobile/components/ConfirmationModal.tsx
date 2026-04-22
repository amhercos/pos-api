import { cn } from "@/src/lib/utils";
import { AlertCircle, AlertTriangle, Info } from "lucide-react-native";
import React, { ReactElement } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  variant?: "danger" | "warning" | "info";
}

export function ConfirmationModal({
  visible,
  title,
  description,
  onConfirm,
  onCancel,
  confirmLabel = "Delete",
  variant = "danger",
}: ConfirmationModalProps): ReactElement {
  // Dynamic Icon selection based on variant
  const getIcon = () => {
    const size = 28;
    switch (variant) {
      case "danger":
        return <AlertCircle size={size} color="#e11d48" />;
      case "warning":
        return <AlertTriangle size={size} color="#d97706" />;
      case "info":
        return <Info size={size} color="#2563eb" />;
      default:
        return <AlertCircle size={size} color="#e11d48" />;
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable
        className="flex-1 bg-slate-900/60 justify-center items-center px-8"
        onPress={onCancel}
      >
        <Pressable
          className="bg-white w-full max-w-sm rounded-[40px] p-10 items-center shadow-2xl"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Centered Icon with Soft Glow Container */}
          <View
            className={cn(
              "w-20 h-20 rounded-full items-center justify-center mb-8",
              variant === "danger"
                ? "bg-rose-50"
                : variant === "warning"
                  ? "bg-amber-50"
                  : "bg-blue-50",
            )}
          >
            <View
              className={cn(
                "w-14 h-14 rounded-full items-center justify-center",
                variant === "danger"
                  ? "bg-rose-100"
                  : variant === "warning"
                    ? "bg-amber-100"
                    : "bg-blue-100",
              )}
            >
              {getIcon()}
            </View>
          </View>

          {/* Text Content: Centered Hierarchy */}
          <Text className="text-2xl font-black text-slate-900 mb-3 text-center tracking-tight">
            {title}
          </Text>
          <Text className="text-slate-500 text-[15px] leading-6 mb-10 text-center font-medium">
            {description}
          </Text>

          {/* Action Stack: Vertical for better thumb reach and clarity */}
          <View className="w-full gap-3">
            <TouchableOpacity
              onPress={onConfirm}
              activeOpacity={0.8}
              className={cn(
                "w-full py-5 rounded-3xl shadow-sm",
                variant === "danger"
                  ? "bg-rose-600"
                  : variant === "warning"
                    ? "bg-amber-600"
                    : "bg-slate-900",
              )}
            >
              <Text className="text-center font-black text-white text-[16px] tracking-wide">
                {confirmLabel}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onCancel}
              activeOpacity={0.6}
              className="w-full py-5 rounded-3xl bg-transparent"
            >
              <Text className="text-center font-bold text-slate-400 text-[15px]">
                Maybe later
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
