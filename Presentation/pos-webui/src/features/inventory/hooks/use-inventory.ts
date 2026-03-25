import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { 
  Product, 
  Category, 
  CreateProductRequest, 
  UpdateProductRequest,
  PagedResponse,
  BaseErrorResponse
} from "../types";

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchData = useCallback(async (page: number = 1, pageSize: number = 24, replace: boolean = false) => {
    setLoading(true);
    try {
      if (page === 1 || replace) {
        // Parallel fetch for initial load or page replacement
        const [pRes, cRes] = await Promise.all([
          apiClient.get<PagedResponse<Product>>(`/Product?page=${page}&pageSize=${pageSize}`),
          apiClient.get<Category[]>("/Categories")
        ]);

        setProducts(pRes.data.items);
        setCategories(cRes.data);
        setTotalCount(pRes.data.totalCount);
        setHasMore(pRes.data.items.length < pRes.data.totalCount);
      } else {
        // Infinite scroll fetch
        const pRes = await apiClient.get<PagedResponse<Product>>(`/Product?page=${page}&pageSize=${pageSize}`);
        
        setProducts(prev => [...prev, ...pRes.data.items]);
        
        const loadedSoFar = (page - 1) * pageSize + pRes.data.items.length;
        setHasMore(loadedSoFar < pRes.data.totalCount);
      }
    } catch (err) {
      const error = err as AxiosError<BaseErrorResponse>;
      console.error("Fetch failed:", error.message);
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, []);

  const addProduct = async (data: CreateProductRequest) => {
    try {
      await apiClient.post("/Product", data);
      // Refresh to page 1 and replace the list to show the new item
      await fetchData(1, 24, true); 
      toast.success("Product added successfully");
    } catch (err) {
      const error = err as AxiosError<BaseErrorResponse>;
      // Captures the custom Exception message from your .NET Handler
      const message = error.response?.data?.message || "Failed to add product";
      toast.error(message);
    }
  };

  const deleteProduct = async (id: string) => {
    const previousProducts = products;
    // Optimistic UI update
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
    try {
      await apiClient.put(`/Product/${id}`, updatedData);
      await fetchData(1, 18, true); 
      toast.success("Product updated");
    } catch (err) {
      const error = err as AxiosError<BaseErrorResponse>;
      toast.error(error.response?.data?.message || "Failed to update product");
    }
  };

  const addCategory = async (name: string) => {
    try {
      await apiClient.post("/Categories", { categoryName: name });
      await fetchData(1, 24, true);
      toast.success(`Category "${name}" created`);
    } catch {
      toast.error("Failed to create category");
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await apiClient.delete(`/Categories/${id}`);
      await fetchData(1, 24, true);
      toast.success("Category deleted");
    } catch {
      toast.error("Category is currently in use");
    }
  };

  useEffect(() => {
    fetchData(1, 24, true);
  }, [fetchData]);

  return { 
    products, 
    categories, 
    loading, 
    hasMore, 
    totalCount,
    addProduct, 
    addCategory, 
    deleteProduct, 
    deleteCategory, 
    updateProduct,
    // Use replace=true for InventoryPage pagination, false for NewSalePage infinite scroll
    fetchMore: (nextPage: number, pageSize: number = 24, replace: boolean = false) => 
    fetchData(nextPage, pageSize, replace), 
    refresh: () => fetchData(1, 24, true) 
  };
}