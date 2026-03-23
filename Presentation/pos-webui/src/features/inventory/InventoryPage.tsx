import { useState } from "react";
import { useInventory } from "./hooks/use-inventory";
import { InventoryTable } from "./components/inventory-table";
import { AddProductModal } from "./components/add-product-modal";
import { EditProductModal } from "./components/edit-product-modal";
import { CategoryManagerModal } from "./components/category-manager-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, FolderPlus, Search } from "lucide-react";
import { type Product } from "./types";

export function InventoryPage() {
  const { 
    products, 
    categories, 
    loading, 
    addProduct, 
    addCategory, 
    deleteProduct, 
    deleteCategory,
    updateProduct 
  } = useInventory();

  const [search, setSearch] = useState("");
  const [showProdModal, setShowProdModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5 p-4 lg:p-6 max-w-6xl mx-auto w-full bg-white min-h-screen">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Inventory</h1>
          <p className="text-[12px] text-slate-400 font-medium">Stock levels and catalog</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            className="h-10 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors" 
            onClick={() => setShowCatModal(true)}
          >
            <FolderPlus className="h-4 w-4 mr-2 text-slate-400" /> Category
          </Button>
          <Button 
            className="h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold shadow-md active:scale-95 transition-all" 
            onClick={() => setShowProdModal(true)}
          >
            <Plus className="h-4 w-4 mr-2 stroke-3" /> Add Product
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <Input 
          placeholder="Search catalog..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10 border-slate-100 bg-slate-50/50 rounded-xl text-[13px] focus:bg-white transition-all" 
        />
      </div>

      <InventoryTable 
        products={filtered} 
        loading={loading} 
        onDelete={deleteProduct} 
        onEdit={(p) => setEditingProduct(p)} 
      />

      <AddProductModal 
        isOpen={showProdModal} 
        onClose={() => setShowProdModal(false)} 
        categories={categories} 
        onAdd={addProduct} 
        onOpenCategoryManager={() => setShowCatModal(true)} 
      />

      <EditProductModal 
        product={editingProduct} 
        isOpen={!!editingProduct} 
        onClose={() => setEditingProduct(null)} 
        categories={categories} 
        onUpdate={updateProduct}
        onOpenCategoryManager={() => setShowCatModal(true)}
      />

      <CategoryManagerModal 
        isOpen={showCatModal} 
        onClose={() => setShowCatModal(false)} 
        categories={categories} 
        onAdd={addCategory} 
        onDelete={deleteCategory} 
      />
    </div>
  );
}