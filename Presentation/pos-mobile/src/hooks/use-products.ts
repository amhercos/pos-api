import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { InventoryService } from "../services/inventoryService";

export interface ProductOption {
  id: string;
  name: string;
  price: number;
}

export function useProducts() {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);

    try {
      const res = await InventoryService.getProducts(1, 1000);

      const mapped: ProductOption[] = res.data.items.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
      }));

      setProducts(mapped);
    } catch {
      Alert.alert("Error", "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    refresh: fetchProducts,
  };
}
