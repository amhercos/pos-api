import { ChangePasswordModal } from "@/components/settings/ChangePasswordModal";
import { useAuth } from "@/src/context/AuthContext";
import { useSettings } from "@/src/hooks/use-settings";
import { Stack } from "expo-router";
import {
  ChevronRight,
  Info,
  Lock,
  LucideIcon,
  Store,
  User,
} from "lucide-react-native";
import { Skeleton } from "moti/skeleton";
import React, { memo, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SettingRowProps {
  icon: LucideIcon;
  label: string;
  value?: string;
  onPress: () => void;
  isLast?: boolean;
}

interface EditFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: "default" | "numeric";
}

const SectionHeader = memo(
  ({ title }: { title: string }): React.JSX.Element => (
    <Text className="text-[11px] font-black text-slate-400 uppercase tracking-[1.5px] ml-5 mb-2 mt-6">
      {title}
    </Text>
  ),
);
SectionHeader.displayName = "SectionHeader";

const SettingRow = memo(
  ({
    icon: Icon,
    label,
    value,
    onPress,
    isLast = false,
  }: SettingRowProps): React.JSX.Element => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center bg-white px-5 py-4 ${!isLast ? "border-b border-slate-50" : ""}`}
    >
      <View className="p-2 rounded-lg bg-slate-50">
        <Icon size={18} color="#64748b" />
      </View>
      <Text className="flex-1 ml-4 font-semibold text-[15px] text-slate-700">
        {label}
      </Text>
      {value && (
        <Text className="text-slate-400 text-[14px] mr-2" numberOfLines={1}>
          {value}
        </Text>
      )}
      <ChevronRight size={16} color="#cbd5e1" />
    </TouchableOpacity>
  ),
);
SettingRow.displayName = "SettingRow";

const EditField = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
}: EditFieldProps): React.JSX.Element => (
  <View className="mb-4">
    <Text className="text-slate-500 text-[12px] font-bold mb-1 ml-1 uppercase">
      {label}
    </Text>
    <TextInput
      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700"
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
    />
  </View>
);

export default function SettingsScreen(): React.JSX.Element {
  const { user } = useAuth();
  const {
    isLoading,
    editableProfile,
    setEditableProfile,
    editableStoreSettings,
    setEditableStoreSettings,
    isProfileDirty,
    isStoreDirty,
    updateProfile,
    updateStoreSettings,
  } = useSettings();

  const [pwModalVisible, setPwModalVisible] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"menu" | "profile" | "store">(
    "menu",
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <Stack.Screen options={{ title: "Settings" }} />
        <View className="p-5 space-y-6">
          <Skeleton colorMode="light" width="100%" height={100} radius={20} />
          <Skeleton colorMode="light" width="100%" height={250} radius={20} />
        </View>
      </SafeAreaView>
    );
  }

  if (viewMode === "profile") {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Stack.Screen
          options={{ title: "Edit Profile", headerShadowVisible: false }}
        />
        <ScrollView className="p-5">
          <EditField
            label="Full Name"
            value={editableProfile?.fullName || ""}
            onChangeText={(t: string) =>
              setEditableProfile((p) => (p ? { ...p, fullName: t } : null))
            }
            placeholder="Enter full name"
          />
          <EditField
            label="Username"
            value={editableProfile?.userName || ""}
            onChangeText={(t: string) =>
              setEditableProfile((p) => (p ? { ...p, userName: t } : null))
            }
            placeholder="Enter username"
          />
          <View className="flex-row gap-x-3 mt-4">
            <TouchableOpacity
              onPress={() => setViewMode("menu")}
              className="flex-1 bg-slate-100 py-4 rounded-2xl"
            >
              <Text className="text-center font-bold text-slate-600">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={!isProfileDirty}
              onPress={() => {
                if (editableProfile) {
                  updateProfile(editableProfile);
                  setViewMode("menu");
                }
              }}
              className={`flex-1 py-4 rounded-2xl ${isProfileDirty ? "bg-blue-600" : "bg-blue-300"}`}
            >
              <Text className="text-center font-bold text-white">
                Save Changes
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (viewMode === "store") {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Stack.Screen
          options={{ title: "Store Management", headerShadowVisible: false }}
        />
        <ScrollView className="p-5">
          <EditField
            label="Store Name"
            value={editableStoreSettings?.storeName || ""}
            onChangeText={(t: string) =>
              setEditableStoreSettings((p) =>
                p ? { ...p, storeName: t } : null,
              )
            }
            placeholder="Enter store name"
          />
          <View className="flex-row gap-x-3">
            <View className="flex-1">
              <EditField
                label="Low Stock Threshold"
                value={
                  editableStoreSettings?.lowStockThreshold?.toString() || "0"
                }
                onChangeText={(t: string) =>
                  setEditableStoreSettings((p) =>
                    p ? { ...p, lowStockThreshold: parseInt(t) || 0 } : null,
                  )
                }
                placeholder="5"
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <EditField
                label="Expiry Notice (Days)"
                value={
                  editableStoreSettings?.nearExpiryAlertDays?.toString() || "0"
                }
                onChangeText={(t: string) =>
                  setEditableStoreSettings((p) =>
                    p ? { ...p, nearExpiryAlertDays: parseInt(t) || 0 } : null,
                  )
                }
                placeholder="30"
                keyboardType="numeric"
              />
            </View>
          </View>
          <TouchableOpacity
            disabled={!isStoreDirty}
            onPress={() => {
              if (editableStoreSettings) {
                updateStoreSettings(editableStoreSettings);
                setViewMode("menu");
              }
            }}
            className={`py-4 rounded-2xl mt-4 ${isStoreDirty ? "bg-blue-600" : "bg-blue-300"}`}
          >
            <Text className="text-center font-bold text-white">
              Save Store Settings
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode("menu")}
            className="py-4 mt-2"
          >
            <Text className="text-center font-bold text-slate-400">
              Go Back
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <Stack.Screen
        options={{
          title: "Settings",
          headerLargeTitle: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: "#f8fafc" },
        }}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="items-center py-8 bg-white border-b border-slate-100 shadow-sm mb-2">
          <View className="w-20 h-20 bg-blue-600 rounded-full items-center justify-center shadow-lg shadow-blue-200">
            <Text className="text-white text-3xl font-black">
              {editableProfile?.fullName?.charAt(0) ||
                user?.userName?.charAt(0) ||
                "?"}
            </Text>
          </View>
          <Text className="text-xl font-bold text-slate-900 mt-4">
            {editableProfile?.fullName || "BizFlow User"}
          </Text>
          <View className="mt-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
            <Text className="text-blue-600 text-[10px] font-black uppercase tracking-widest">
              {user?.role || "Staff"}
            </Text>
          </View>
        </View>

        <SectionHeader title="Account" />
        <View className="mx-4 overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
          <SettingRow
            icon={User}
            label="Personal Details"
            value={editableProfile?.userName}
            onPress={() => setViewMode("profile")}
          />
        </View>

        {user?.role === "StoreOwner" && (
          <>
            <SectionHeader title="Business" />
            <View className="mx-4 overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
              <SettingRow
                icon={Store}
                label="Store Settings"
                value={editableStoreSettings?.storeName}
                isLast={true}
                onPress={() => setViewMode("store")}
              />
            </View>
          </>
        )}

        <SectionHeader title="Security" />
        <View className="mx-4 overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
          <SettingRow
            icon={Lock}
            label="Change Password"
            onPress={() => setPwModalVisible(true)}
          />
          <SettingRow
            icon={Info}
            label="About BizFlow"
            isLast={true}
            onPress={() => {}}
          />
        </View>

        <View className="mt-10 items-center pb-10">
          <Text className="text-slate-300 text-[11px] font-black uppercase tracking-[2px]">
            BizFlow v1.0 • Stable Build
          </Text>
        </View>
      </ScrollView>

      <ChangePasswordModal
        visible={pwModalVisible}
        onClose={() => setPwModalVisible(false)}
      />
    </SafeAreaView>
  );
}
