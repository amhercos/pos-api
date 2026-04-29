import { Eye, EyeOff, ShieldCheck, X } from "lucide-react-native";
import React, { memo, useCallback, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useSettings } from "../../src/hooks/use-settings";

interface Props {
  visible: boolean;
  onClose: () => void;
}

interface PasswordInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
}

const PasswordInput = memo(
  ({ label, value, onChangeText }: PasswordInputProps): React.JSX.Element => {
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const handleToggle = useCallback((): void => {
      setShowPassword((prev: boolean) => !prev);
    }, []);

    return (
      <View className="mb-4">
        <Text className="text-slate-500 text-[11px] font-black uppercase tracking-wider mb-1.5 ml-1">
          {label}
        </Text>
        <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-0.5">
          <TextInput
            secureTextEntry={!showPassword}
            className="flex-1 py-3.5 font-semibold text-slate-700"
            value={value}
            onChangeText={onChangeText}
            placeholder={`Enter ${label.toLowerCase()}`}
            placeholderTextColor="#cbd5e1"
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={handleToggle}
            className="p-2"
            activeOpacity={0.5}
          >
            {showPassword ? (
              <EyeOff size={18} color="#94a3b8" />
            ) : (
              <Eye size={18} color="#94a3b8" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export const ChangePasswordModal = memo(
  ({ visible, onClose }: Props): React.JSX.Element => {
    const { changePassword } = useSettings();
    const [loading, setLoading] = useState<boolean>(false);
    const [form, setForm] = useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    const handleUpdate = useCallback(async (): Promise<void> => {
      if (form.newPassword !== form.confirmPassword) {
        Toast.show({
          type: "error",
          text1: "Validation Error",
          text2: "New passwords do not match",
        });
        return;
      }

      setLoading(true);
      try {
        await changePassword({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        });
        setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        onClose();
      } catch {
        // Catch block without identifier to satisfy "no-unused-vars"
      } finally {
        setLoading(false);
      }
    }, [form, changePassword, onClose]);

    const canSubmit: boolean =
      form.currentPassword.length > 0 &&
      form.newPassword.length >= 6 &&
      form.newPassword === form.confirmPassword;

    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={onClose}
      >
        <View className="flex-1 justify-end bg-slate-900/60">
          <Pressable className="flex-1" onPress={onClose} />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View className="bg-white rounded-t-[40px] p-8 pb-12">
              <View className="w-12 h-1.5 bg-slate-100 rounded-full self-center mb-6" />

              <View className="flex-row justify-between items-center mb-8">
                <View className="flex-row items-center">
                  <View className="bg-blue-50 p-2 rounded-xl">
                    <ShieldCheck size={24} color="#2563eb" />
                  </View>
                  <View className="ml-4">
                    <Text className="text-xl font-black text-slate-900">
                      Security
                    </Text>
                    <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      Update Credentials
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  className="p-2 bg-slate-100 rounded-full"
                >
                  <X size={20} color="#64748b" />
                </TouchableOpacity>
              </View>

              <View>
                <PasswordInput
                  label="Current Password"
                  value={form.currentPassword}
                  onChangeText={(t: string) =>
                    setForm((f) => ({ ...f, currentPassword: t }))
                  }
                />
                <PasswordInput
                  label="New Password"
                  value={form.newPassword}
                  onChangeText={(t: string) =>
                    setForm((f) => ({ ...f, newPassword: t }))
                  }
                />
                <PasswordInput
                  label="Confirm Password"
                  value={form.confirmPassword}
                  onChangeText={(t: string) =>
                    setForm((f) => ({ ...f, confirmPassword: t }))
                  }
                />
              </View>

              <TouchableOpacity
                disabled={loading || !canSubmit}
                onPress={() => {
                  void handleUpdate();
                }}
                className={`py-4 rounded-2xl mt-4 flex-row justify-center items-center ${
                  canSubmit ? "bg-blue-600" : "bg-slate-200"
                }`}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text
                    className={`font-black text-base ${canSubmit ? "text-white" : "text-slate-400"}`}
                  >
                    Update Password
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    );
  },
);

ChangePasswordModal.displayName = "ChangePasswordModal";
