import type { Category } from "@/src/types/inventory";
import { Edit3, FolderTree, Trash2, X } from "lucide-react-native";
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
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function CategoryManagerModal({
  isOpen,
  onClose,
  categories,
  onAdd,
  onRename,
  onDelete,
}: CategoryManagerProps) {
  const [categoryNameInput, setCategoryNameInput] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [loadingAction, setLoadingAction] = useState<"add" | "rename" | null>(
    null,
  );

  const selectedCategory = categories.find(
    (category) => category.id === editingCategoryId,
  );

  const handlePrimaryAction = async () => {
    const trimmedName = categoryNameInput.trim();
    if (!trimmedName) return;

    if (editingCategoryId) {
      setLoadingAction("rename");
      try {
        await onRename(editingCategoryId, trimmedName);
        setEditingCategoryId(null);
        setCategoryNameInput("");
      } finally {
        setLoadingAction(null);
      }
      return;
    }

    setLoadingAction("add");
    try {
      await onAdd(trimmedName);
      setCategoryNameInput("");
    } finally {
      setLoadingAction(null);
    }
  };

  const startRename = (category: Category) => {
    setEditingCategoryId(category.id);
    setCategoryNameInput(category.name);
  };

  const cancelRename = () => {
    setEditingCategoryId(null);
    setCategoryNameInput("");
  };

  const isPrimaryButtonDisabled =
    !categoryNameInput.trim() ||
    (!!editingCategoryId &&
      selectedCategory?.name === categoryNameInput.trim());

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
                  placeholder={
                    editingCategoryId ? "Rename category..." : "New category..."
                  }
                  className="flex-1 px-3 text-sm font-bold h-10"
                  value={categoryNameInput}
                  onChangeText={setCategoryNameInput}
                />
                <TouchableOpacity
                  onPress={handlePrimaryAction}
                  disabled={
                    isPrimaryButtonDisabled ||
                    loadingAction === "add" ||
                    loadingAction === "rename"
                  }
                  className="bg-slate-900 px-4 py-2 rounded-xl"
                >
                  {loadingAction === "add" || loadingAction === "rename" ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-white text-xs font-bold">
                      {editingCategoryId ? "Save" : "Add"}
                    </Text>
                  )}
                </TouchableOpacity>
                {editingCategoryId ? (
                  <TouchableOpacity
                    onPress={cancelRename}
                    className="ml-2 px-4 py-2 rounded-xl border border-slate-200"
                  >
                    <Text className="text-slate-600 text-xs font-bold">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            <View className="px-6 py-4 pb-8">
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 300 }}
              >
                <View className="overflow-hidden rounded-[24px] border border-slate-200/70 divide-y divide-slate-200/70">
                  {categories.map((c) => (
                    <View
                      key={c.id}
                      className="flex-row items-center justify-between px-4 py-4 bg-white"
                    >
                      <View>
                        <Text className="text-sm font-semibold text-slate-700">
                          {c.name}
                          <Text className="text-slate-400 font-normal">
                            {` (${c.productCount})`}
                          </Text>
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <TouchableOpacity
                          onPress={() => startRename(c)}
                          className="p-2 rounded-xl bg-slate-100/80"
                        >
                          <Edit3 size={16} color="#475569" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => onDelete(c.id)}
                          className="p-2 rounded-lg"
                        >
                          <Trash2 size={14} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
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
