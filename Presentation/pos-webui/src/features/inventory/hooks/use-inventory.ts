import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import type { Product, Category, CreateProductRequest, UpdateProductRequest } from "../types";

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        apiClient.get<Product[]>("/Product"),
        apiClient.get<Category[]>("/Categories")
      ]);
      setProducts(pRes.data);
      setCategories(cRes.data);
    } catch (err) {
      console.error("Fetch failed:", err instanceof Error ? err.message : err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addProduct = async (data: CreateProductRequest) => {
    try {
      await apiClient.post("/Product", data);
      await fetchData();
      toast.success("Product added successfully");
    } catch {
      toast.error("Failed to add product");
    }
  };


  const deleteProduct = async (id: string) => {
  const previousProducts = products;
  setProducts(prev => prev.filter(p => p.id !== id));

  try {
    await apiClient.delete(`/Product/${id}`);
    toast.success("Product removed");
  } catch {
    setProducts(previousProducts);
    toast.error("Failed to delete product");
  }
};

  const updateProduct = async (id: string, updatedData: UpdateProductRequest) => {
    await apiClient.put(`/Product/${id}`, updatedData);
    await fetchData();
  };

  const addCategory = async (name: string) => {
    try {
      await apiClient.post("/Categories", { categoryName: name });
      await fetchData();
      toast.success(`Category "${name}" created`);
    } catch {
      toast.error("Failed to create category");
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await apiClient.delete(`/Categories/${id}`);
      await fetchData();
      toast.success("Category deleted");
    } catch {
      toast.error("Category is currently in use");
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { 
    products, categories, loading, 
    addProduct, addCategory, deleteProduct, deleteCategory, updateProduct,
    refresh: fetchData 
  };
}