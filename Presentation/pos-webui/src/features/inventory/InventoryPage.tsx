import { useState, useMemo, useEffect } from "react";
import { useInventory } from "./hooks/use-inventory";
import { InventoryTable } from "./components/inventory-table";
import { AddProductModal } from "./components/add-product-modal";
import { EditProductModal } from "./components/edit-product-modal";
import { CategoryManagerModal } from "./components/category-manager-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderPlus, Search, RefreshCcw, Filter, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { type Product } from "./types";
import { cn } from "@/lib/utils";

export function InventoryPage() {
  const PAGE_SIZE = 10; 
  const { 
    products, categories, loading, hasMore, fetchMore,
    addProduct, addCategory, deleteProduct, deleteCategory, updateProduct, refresh 
  } = useInventory();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showProdModal, setShowProdModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchMore(1, PAGE_SIZE, true);
  }, []);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCat = selectedCategory === "all" || p.categoryId === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [products, search, selectedCategory]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchMore(newPage, PAGE_SIZE, true); 
  };

  return (
    <div className="flex flex-col h-screen bg-white text-slate-900 overflow-hidden font-sans antialiased">
      {/* THINNER HEADER: Compressed into one functional bar */}
      <div className="px-6 py-4 max-w-7xl mx-auto w-full flex items-center justify-between border-b border-slate-100 bg-white z-10">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-bold tracking-tight">Inventory</h1>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest border-l pl-3 border-slate-200">Master Catalog</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={refresh} className="text-slate-400 hover:text-slate-600 h-8 w-8 p-0">
            <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          <Button 
            size="sm"
            className="bg-slate-900 hover:bg-black text-white rounded-lg px-4 h-9 text-xs font-semibold transition-all shadow-sm"
            onClick={() => setShowProdModal(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Product
          </Button>
        </div>
      </div>

      {/* FILTER BAR: Minimalist spacing */}
      <div className="px-6 py-3 max-w-7xl mx-auto w-full flex items-center gap-4 bg-slate-50/30">
        <div className="relative flex-1 max-w-xs group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 transition-colors" />
          <Input 
            placeholder="Search catalog..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-slate-200 bg-white h-9 pl-9 text-sm font-medium rounded-lg focus-visible:ring-1 focus-visible:ring-slate-200"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[160px] border-slate-200 bg-white rounded-lg h-9 px-3 text-xs font-semibold text-slate-600 shadow-sm">
              <Filter className="h-3 w-3 mr-2 text-slate-400" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            {/* Keeping the dropdown design you liked */}
            <SelectContent 
              position="popper" 
              sideOffset={8}
              className="bg-white border border-slate-200 shadow-xl rounded-xl p-1 w-[180px] max-h-[220px] overflow-y-auto"
            >
              <SelectItem value="all" className="text-xs font-semibold rounded-lg py-2 px-3 focus:bg-slate-50 cursor-pointer">All Items</SelectItem>
              <div className="h-px bg-slate-100 my-1 mx-1" />
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id} className="text-xs font-semibold rounded-lg py-2 px-3 focus:bg-slate-50 cursor-pointer">
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={() => setShowCatModal(true)} 
            className="rounded-lg h-9 w-9 p-0 border-slate-200 hover:bg-slate-50"
          >
            <FolderPlus className="h-4 w-4 text-slate-500" />
          </Button>
        </div>
      </div>

      {/* TABLE AREA: Maximized space */}
      <div className="flex-1 overflow-y-auto px-6 max-w-7xl mx-auto w-full pb-20 custom-scrollbar">
        <InventoryTable 
          products={filtered} 
          loading={loading} 
          onDelete={deleteProduct} 
          onEdit={(p) => setEditingProduct(p)} 
        />
        
        {/* PAGINATION: Slimmer footer */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 pb-10">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Page {currentPage}</span>
            <span className="text-[11px] text-slate-300">•</span>
            <span className="text-[11px] font-medium text-slate-400">{filtered.length} Items Displayed</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1 || loading}
              className="h-8 px-3 text-xs font-semibold text-slate-500 hover:text-slate-900"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            
            {hasMore && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={loading}
                className="h-8 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      <AddProductModal isOpen={showProdModal} onClose={() => setShowProdModal(false)} categories={categories} onAdd={addProduct} onOpenCategoryManager={() => setShowCatModal(true)} />
      <EditProductModal product={editingProduct} isOpen={!!editingProduct} onClose={() => setEditingProduct(null)} categories={categories} onUpdate={updateProduct} onOpenCategoryManager={() => setShowCatModal(true)} />
      <CategoryManagerModal isOpen={showCatModal} onClose={() => setShowCatModal(false)} categories={categories} onAdd={addCategory} onDelete={deleteCategory} />
    </div>
  );
}