import { useState, useMemo, useEffect } from "react";
import { 
  Dialog, DialogContent, DialogTitle, DialogClose 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PencilLine, Check, Search, Settings2, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Category, Product, UpdateProductRequest } from "../types";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  categories: Category[];
  onUpdate: (id: string, data: UpdateProductRequest) => Promise<void>;
  onOpenCategoryManager: () => void;
}

export function EditProductModal({ 
  isOpen, onClose, product, categories, onUpdate, onOpenCategoryManager 
}: EditProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", price: "", stockQuantity: "", categoryId: "", description: ""
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price.toString(),
        stockQuantity: product.stockQuantity.toString(),
        categoryId: product.categoryId,
        description: product.description || ""
      });
      setSearchQuery(product.categoryName || "");
    }
  }, [product]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return [];
    if (categories.some(c => c.name.toLowerCase() === searchQuery.toLowerCase() && c.id === formData.categoryId)) {
      return [];
    }
    return categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [categories, searchQuery, formData.categoryId]);

  const isValid = useMemo(() => (
    formData.name.trim().length >= 2 && formData.price !== "" && 
    formData.stockQuantity !== "" && formData.categoryId !== ""
  ), [formData]);

  const handleSubmit = async () => {
    if (!isValid || !product) return;
    setLoading(true);
    try {
      await onUpdate(product.id, { 
        name: formData.name,
        price: Number(formData.price), 
        stock: Number(formData.stockQuantity), 
        lowStockThreshold: product.lowStockThreshold || 5,
        categoryId: formData.categoryId,
        description: formData.description,
        expiryDate: product.expiryDate?.split('T')[0] 
      });
      toast.success("Changes saved successfully");
      onClose();
    } catch (err) {
      toast.error("Failed to update product");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "h-11 rounded-2xl border-slate-200 bg-slate-50/50 px-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900/5 transition-all outline-none w-full shadow-sm";
  const labelClass = "text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-110 p-0 rounded-4xl border-none shadow-2xl bg-white outline-none overflow-visible">
        <DialogClose asChild>
          <button className="absolute right-6 top-6 p-2 rounded-full hover:bg-slate-100 transition-all text-slate-400 z-50">
            <X className="h-4 w-4" />
          </button>
        </DialogClose>

        <div className="px-8 pt-10 pb-4 flex flex-col items-center text-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-100">
            <PencilLine className="h-7 w-7" />
          </div>
          <div>
            <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">Edit Product</DialogTitle>
            <p className="text-[13px] font-medium text-slate-400">Update item information</p>
          </div>
        </div>

        <div className="px-8 py-4 space-y-5">
          <div className="space-y-1.5">
            <Label className={labelClass}>Product Name</Label>
            <Input className={inputClass} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className={labelClass}>Price (₱)</Label>
              <Input type="number" className={inputClass} value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>In Stock</Label>
              <Input type="number" className={inputClass} value={formData.stockQuantity} onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})} />
            </div>
          </div>

          <div className="space-y-1.5 relative">
            <div className="flex justify-between items-center mb-1">
              <Label className={labelClass}>Category</Label>
              <button type="button" onClick={onOpenCategoryManager} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-900 transition-colors mr-1">
                <Settings2 className="h-3 w-3" /> Manage
              </button>
            </div>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
              <input 
                placeholder="Search categories..."
                className={cn(inputClass, "pl-11 border border-slate-100 bg-slate-50/50")}
                value={searchQuery}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (formData.categoryId) setFormData({...formData, categoryId: ""});
                }}
              />
            </div>
            {isFocused && searchQuery && filteredCategories.length > 0 && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-100 shadow-2xl rounded-2xl z-50 overflow-hidden">
                <div className="max-h-40 overflow-y-auto p-1.5">
                  {filteredCategories.map((c) => (
                    <button key={c.id} type="button" onClick={() => { setFormData({ ...formData, categoryId: c.id }); setSearchQuery(c.name); }} className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-left">
                      {c.name}
                      {formData.categoryId === c.id && <Check className="h-4 w-4 text-slate-900" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-8 pb-10 pt-4 flex justify-center">
          <Button onClick={handleSubmit} disabled={loading || !isValid} className="h-14 w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-xl shadow-blue-100 transition-all active:scale-[0.98] disabled:opacity-20">
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}