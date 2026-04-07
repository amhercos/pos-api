import { useState, useEffect, useCallback } from "react";
import axios, { type AxiosError } from "axios";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
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
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchData = useCallback(async (page: number = 1, pageSize: number = 24, replace: boolean = false) => {
    setLoading(true);
    try {
      if (page === 1 || replace) {
        const [pRes, cRes] = await Promise.all([
          apiClient.get<PagedResponse<Product>>(`/Product?page=${page}&pageSize=${pageSize}`),
          apiClient.get<Category[]>("/Categories")
        ]);

        setProducts(pRes.data.items);
        setCategories(cRes.data);
        setTotalCount(pRes.data.totalCount);
        setHasMore(pRes.data.items.length < pRes.data.totalCount);
      } else {
        const pRes = await apiClient.get<PagedResponse<Product>>(`/Product?page=${page}&pageSize=${pageSize}`);
        
        setProducts(prev => [...prev, ...pRes.data.items]);
        
        const loadedSoFar = (page - 1) * pageSize + pRes.data.items.length;
        setHasMore(loadedSoFar < pRes.data.totalCount);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const error = err as AxiosError<BaseErrorResponse>;
        toast.error(error.response?.data?.message || "Failed to load inventory");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const addProduct = async (data: CreateProductRequest): Promise<void> => {
    try {
      await apiClient.post("/Product", data);
      await fetchData(1, 24, true); 
      toast.success("Product added successfully");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const error = err as AxiosError<BaseErrorResponse>;
        toast.error(error.response?.data?.message || "Failed to add product");
      }
    }
  };

  const deleteProduct = async (id: string): Promise<void> => {
    const previousProducts = [...products];
    setProducts(prev => prev.filter(p => p.id !== id));
    
    try {
      await apiClient.delete(`/Product/${id}`);
      toast.success("Product removed");
    } catch (err: unknown) {
      setProducts(previousProducts);
      if (axios.isAxiosError(err)) {
        const error = err as AxiosError<BaseErrorResponse>;
        toast.error(error.response?.data?.message || "Failed to delete product");
      }
    }
  };

const updateProduct = async (id: string, updatedData: UpdateProductRequest): Promise<void> => {
  try {
    await apiClient.put(`/Product/${id}`, { ...updatedData, id }); 
    await fetchData(1, 24, true); 
    toast.success("Product updated");
  } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const error = err as AxiosError<BaseErrorResponse>;
        toast.error(error.response?.data?.message || "Failed to update product");
      }
    }
  };

  const addCategory = async (name: string): Promise<void> => {
    try {
      await apiClient.post("/Categories", { CategoryName : name });
      await fetchData(1, 24, true);
      toast.success(`Category "${name}" created`);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const error = err as AxiosError<BaseErrorResponse>;
        toast.error(error.response?.data?.message || "Failed to create category");
      }
    }
  };

  const deleteCategory = async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/Categories/${id}`);
      await fetchData(1, 24, true);
      toast.success("Category deleted");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const error = err as AxiosError<BaseErrorResponse>;
        toast.error(error.response?.data?.message || "Category is currently in use");
      }
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
    fetchMore: (nextPage: number, pageSize: number = 24, replace: boolean = false) => 
      fetchData(nextPage, pageSize, replace), 
    refresh: () => fetchData(1, 24, true) 
  };
}