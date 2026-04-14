import type { Category } from "@/src/types/inventory";
import { FolderTree, Trash2, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAdd: (name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function CategoryManagerModal({
  isOpen,
  onClose,
  categories,
  onAdd,
  onDelete,
}: CategoryManagerProps) {
  const [newCategory, setNewCategory] = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newCategory.trim()) return;
    setLoadingAction("add");
    try {
      await onAdd(newCategory.trim());
      setNewCategory("");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <Modal
      visible={isOpen}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-6">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ width: "100%", maxWidth: 450 }}
        >
          <View className="bg-white rounded-[32px] overflow-hidden shadow-2xl">
            <View className="px-6 pt-6 pb-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 bg-slate-900 rounded-xl items-center justify-center">
                  <FolderTree size={20} color="white" />
                </View>
                <Text className="text-lg font-black text-slate-900">
                  Categories
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                className="p-2 bg-slate-100 rounded-full"
              >
                <X size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View className="px-6 py-2">
              <View className="flex-row items-center bg-slate-50 border border-slate-100 rounded-2xl p-2">
                <TextInput
                  placeholder="New category..."
                  className="flex-1 px-3 text-sm font-bold h-10"
                  value={newCategory}
                  onChangeText={setNewCategory}
                />
                <TouchableOpacity
                  onPress={handleAdd}
                  disabled={loadingAction === "add" || !newCategory.trim()}
                  className="bg-slate-900 px-4 py-2 rounded-xl"
                >
                  {loadingAction === "add" ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-white text-xs font-bold">Add</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View className="px-6 py-4 pb-8">
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 300 }}
              >
                <View className="gap-y-2">
                  {categories.map((c) => (
                    <View
                      key={c.id}
                      className="flex-row items-center justify-between bg-slate-50/50 p-3 rounded-2xl border border-slate-100"
                    >
                      <Text className="text-sm font-bold text-slate-700">
                        {c.name}
                      </Text>
                      <TouchableOpacity
                        onPress={() => onDelete(c.id)}
                        className="p-2 bg-white rounded-lg shadow-sm"
                      >
                        <Trash2 size={14} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
