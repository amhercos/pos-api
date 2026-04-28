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
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [loadingAction, setLoadingAction] = useState<"add" | "rename" | null>(
    null,
  );

  const selectedCategory = categories.find(
    (category) => category.id === editingId,
  );

  const handlePrimaryAction = async () => {
    const trimmedName = categoryNameInput.trim();
    if (!trimmedName) return;

    setLoadingAction("add");
    try {
      await onAdd(trimmedName);
      setCategoryNameInput("");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSaveRename = async () => {
    if (!isEditing || !editingId) return;

    const trimmedName = editingName.trim();
    if (!trimmedName) return;

    setLoadingAction("rename");
    try {
      await onRename(editingId, trimmedName);
      setIsEditing(false);
      setEditingId(null);
      setEditingName("");
    } finally {
      setLoadingAction(null);
    }
  };

  const startRename = (category: Category) => {
    setIsEditing(true);
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const cancelRename = () => {
    setIsEditing(false);
    setEditingId(null);
    setEditingName("");
  };

  const isPrimaryButtonDisabled = !categoryNameInput.trim();
  const isRenameSaveDisabled =
    !editingName.trim() ||
    (!!editingId && selectedCategory?.name === editingName.trim());

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
                  placeholder={"New category..."}
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
                <View className="overflow-hidden rounded-[24px] border border-slate-200/70 divide-y divide-slate-200/70">
                  {categories.map((c) => (
                    <View
                      key={c.id}
                      className="flex-row items-center justify-between gap-3 px-4 py-3"
                    >
                      {editingId === c.id ? (
                        <View className="flex-1 flex-row items-center gap-3">
                          <TextInput
                            autoFocus={true}
                            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800"
                            value={editingName}
                            onChangeText={setEditingName}
                          />
                          <TouchableOpacity
                            onPress={handleSaveRename}
                            disabled={
                              isRenameSaveDisabled || loadingAction === "rename"
                            }
                            className="rounded-2xl bg-slate-900 px-3 py-2"
                          >
                            {loadingAction === "rename" ? (
                              <ActivityIndicator size="small" color="white" />
                            ) : (
                              <Text className="text-white text-xs font-bold">
                                Save
                              </Text>
                            )}
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={cancelRename}
                            className="rounded-2xl border border-slate-200 px-3 py-2"
                          >
                            <Text className="text-slate-600 text-xs font-bold">
                              Cancel
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View className="flex-1 flex-row items-center justify-between gap-3">
                          <View className="flex-1 flex-row items-center gap-6">
                            <Text className="text-base font-semibold text-slate-900">
                              {c.name}
                            </Text>
                            <Text className="text-sm font-medium text-slate-700">
                              {c.productCount} items
                            </Text>
                          </View>
                          <View className="flex-row items-center gap-3">
                            <TouchableOpacity
                              onPress={() => startRename(c)}
                              className="p-3 rounded-2xl bg-slate-100/90"
                            >
                              <Edit3 size={18} color="#475569" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => onDelete(c.id)}
                              className="p-3 rounded-2xl bg-white shadow-sm"
                            >
                              <Trash2 size={16} color="#ef4444" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
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
