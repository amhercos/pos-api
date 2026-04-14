import { isAxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { InventoryService } from "../services/inventoryService";
import type {
    Category,
    CreateProductRequest,
    Product,
    UpdateProductRequest,
} from "../types/inventory";

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const handleError = useCallback((err: unknown, defaultMsg: string) => {
    let msg = defaultMsg;
    if (isAxiosError(err)) {
      msg = err.response?.data?.message || defaultMsg;
    } else if (err instanceof Error) {
      msg = err.message;
    }
    Toast.show({
      type: "error",
      text1: "Error",
      text2: msg,
    });
  }, []);

  const refresh = useCallback(
    async (page = 1, pageSize = 24) => {
      setLoading(true);
      try {
        const [pRes, cRes] = await Promise.all([
          InventoryService.getProducts(page, pageSize),
          InventoryService.getCategories(),
        ]);
        setProducts(pRes.data.items);
        setCategories(cRes.data);
        setHasMore(pRes.data.items.length < pRes.data.totalCount);
      } catch (err) {
        handleError(err, "Failed to load inventory");
      } finally {
        setLoading(false);
      }
    },
    [handleError],
  );

  // --- Product Actions ---

  const addProduct = async (data: CreateProductRequest) => {
    try {
      await InventoryService.createProduct(data);
      Toast.show({ type: "success", text1: "Added", text2: "Product created" });
      refresh();
    } catch (err) {
      handleError(err, "Failed to add product");
    }
  };

  const updateProduct = async (id: string, data: UpdateProductRequest) => {
    try {
      await InventoryService.updateProduct(id, data);
      Toast.show({
        type: "success",
        text1: "Updated",
        text2: "Product updated",
      });
      refresh();
    } catch (err) {
      handleError(err, "Failed to update product");
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await InventoryService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      Toast.show({ type: "info", text1: "Deleted", text2: "Product removed" });
    } catch (err) {
      handleError(err, "Failed to delete product");
    }
  };

  const addCategory = async (name: string) => {
    try {
      await InventoryService.createCategory(name);

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Category added",
      });
      refresh();
    } catch (err) {
      handleError(err, "Failed to add category");
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await InventoryService.deleteCategory(id);
      Toast.show({ type: "info", text1: "Deleted", text2: "Category removed" });
      refresh(); // Refresh to update both categories and products (in case some items lost their category)
    } catch (err) {
      handleError(err, "Failed to delete category");
    }
  };

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    products,
    categories,
    loading,
    hasMore,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    deleteCategory,
    refresh,
  };
}
