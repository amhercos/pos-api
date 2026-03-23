import { useState, useMemo } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogClose 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PackagePlus, Check, Search, Settings2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category, CreateProductRequest } from "../types";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAdd: (data: CreateProductRequest) => Promise<void>;
  onOpenCategoryManager: () => void;
}

export function AddProductModal({ 
  isOpen, 
  onClose, 
  categories, 
  onAdd, 
  onOpenCategoryManager 
}: AddProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    price: "", 
    stockQuantity: "", 
    categoryId: "" 
  });

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return [];
    // Hide suggestions if the exact match is already selected
    if (categories.some(c => c.name.toLowerCase() === searchQuery.toLowerCase() && c.id === formData.categoryId)) {
        return [];
    }
    return categories.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery, formData.categoryId]);

  const isValid = useMemo(() => (
    formData.name.trim().length >= 2 && 
    formData.price !== "" && 
    formData.stockQuantity !== "" && 
    categories.some(c => c.id === formData.categoryId)
  ), [formData, categories]);

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      await onAdd({ 
        ...formData, 
        price: Number(formData.price), 
        stockQuantity: Number(formData.stockQuantity), 
        expiryDate: new Date().toISOString().split('T')[0] 
      } as CreateProductRequest);
      
      // Reset Form
      setFormData({ name: "", price: "", stockQuantity: "", categoryId: "" });
      setSearchQuery("");
      onClose();
    } catch (error) {
      console.error("Failed to add product:", error);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "h-11 rounded-2xl border-slate-200 bg-slate-50/50 px-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900/5 transition-all outline-none w-full shadow-sm";
  const labelClass = "text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        onPointerDownOutside={(e) => e.preventDefault()}
        className="sm:max-w-110 p-0 rounded-4xl border-none shadow-2xl bg-white outline-none overflow-visible"
      >
        
        {/* MANUAL X BUTTON - Uses DialogClose since it's missing from your dialog.tsx */}
        <DialogClose asChild>
          <button 
            type="button"
            className="absolute right-6 top-6 p-2 rounded-full hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-900 z-50 outline-none active:scale-90"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogClose>

        {/* HEADER */}
        <div className="px-8 pt-10 pb-4 relative">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-200">
              <PackagePlus className="h-7 w-7" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">
                New Product
              </DialogTitle>
              <p className="text-[13px] font-medium text-slate-400">Add to your active inventory</p>
            </div>
          </div>
        </div>

        {/* FORM BODY */}
        <div className="px-8 py-4 space-y-5">
          {/* Name Field */}
          <div className="space-y-1.5">
            <Label className={labelClass}>Product Name</Label>
            <Input 
              placeholder="e.g. Arabica Coffee" 
              className={inputClass} 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
            />
          </div>

          {/* Price & Stock Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className={labelClass}>Price (₱)</Label>
              <Input 
                type="number" 
                placeholder="0.00" 
                className={inputClass} 
                value={formData.price} 
                onChange={(e) => setFormData({...formData, price: e.target.value})} 
              />
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>In Stock</Label>
              <Input 
                type="number" 
                placeholder="0" 
                className={inputClass} 
                value={formData.stockQuantity} 
                onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})} 
              />
            </div>
          </div>

          {/* Category Search Field */}
          <div className="space-y-1.5 relative">
            <div className="flex justify-between items-center mb-1">
              <Label className={labelClass}>Category</Label>
              <button 
                type="button"
                onClick={onOpenCategoryManager}
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-900 transition-colors mr-1"
              >
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

            {/* CATEGORY SUGGESTIONS DROPUP/DROPDOWN */}
            {isFocused && searchQuery && filteredCategories.length > 0 && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="max-h-40 overflow-y-auto p-1.5">
                    {filteredCategories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, categoryId: c.id });
                          setSearchQuery(c.name);
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-left"
                      >
                        {c.name}
                        {formData.categoryId === c.id && <Check className="h-4 w-4 text-slate-900" />}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-8 pb-10 pt-4 flex justify-center">
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !isValid} 
            className="h-14 w-full rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-base shadow-xl shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-20"
          >
            {loading ? "Creating..." : "Create Product"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}