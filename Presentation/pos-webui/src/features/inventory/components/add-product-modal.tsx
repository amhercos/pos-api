import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PackagePlus, Check, Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category, CreateProductRequest } from "../types";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAdd: (data: CreateProductRequest) => Promise<void>;
  onOpenCategoryManager: () => void;
}

export function AddProductModal({ isOpen, onClose, categories, onAdd, onOpenCategoryManager }: AddProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", price: "", stockQuantity: "", categoryId: "", description: "", expiryDate: "" 
  });

  const filteredCategories = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return query ? categories.filter(c => c.name.toLowerCase().includes(query)) : categories.slice(0, 5);
  }, [categories, searchQuery]);

  const isValid = useMemo(() => (
    formData.name.trim().length >= 2 && formData.price !== "" && formData.stockQuantity !== ""
  ), [formData]);

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      await onAdd({ 
        name: formData.name,
        description: formData.description,
        price: Number(formData.price), 
        stockQuantity: Number(formData.stockQuantity),
        categoryId: formData.categoryId || null,
        expiryDate: formData.expiryDate || null // Null if empty string
      });
      setFormData({ name: "", price: "", stockQuantity: "", categoryId: "", description: "", expiryDate: "" });
      setSearchQuery("");
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "h-10 rounded-xl border-slate-200 bg-slate-50/50 px-3 text-sm font-medium focus:bg-white focus:ring-1 focus:ring-slate-200 transition-all outline-none w-full";
  const labelClass = "text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 rounded-3xl border-none shadow-2xl bg-white overflow-visible">
        <DialogClose asChild>
          <button className="absolute right-4 top-4 p-2 rounded-full hover:bg-slate-100 transition-all text-slate-400 active:scale-90">
            <X className="h-4 w-4" />
          </button>
        </DialogClose>

        <div className="px-6 pt-7 pb-3 flex items-center gap-4 border-b border-slate-50">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg">
            <PackagePlus className="h-5 w-5" />
          </div>
          <div className="text-left">
            <DialogTitle className="text-lg font-bold text-slate-900">New Product</DialogTitle>
            <p className="text-[12px] font-medium text-slate-400">Add to inventory</p>
          </div>
        </div>

        <div className="px-6 py-4 space-y-3">
          <div className="space-y-1">
            <Label className={labelClass}>Product Name</Label>
            <Input placeholder="e.g. Arabica Coffee" className={inputClass} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className={labelClass}>Price (₱)</Label>
              <Input type="number" placeholder="0.00" className={inputClass} value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
            </div>
            <div className="space-y-1">
              <Label className={labelClass}>In Stock</Label>
              <Input type="number" placeholder="0" className={inputClass} value={formData.stockQuantity} onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1 relative">
              <div className="flex justify-between items-center pr-1">
                <Label className={labelClass}>Category</Label>
                <button type="button" onClick={onOpenCategoryManager} className="text-[9px] font-bold text-slate-600 uppercase">Manage</button>
              </div>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input 
                  placeholder="Optional..."
                  className={cn(inputClass, "pl-9 border-slate-100")}
                  value={searchQuery}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {isFocused && filteredCategories.length > 0 && (
                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-slate-100 shadow-xl rounded-xl z-50 p-1 max-h-32 overflow-y-auto">
                  {filteredCategories.map((c) => (
                    <button 
                      key={c.id} 
                      type="button" 
                      onMouseDown={(e) => { 
                        e.preventDefault(); 
                        setFormData(prev => ({ ...prev, categoryId: c.id })); 
                        setSearchQuery(c.name); 
                        setIsFocused(false); 
                      }} 
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 text-left"
                    >
                      {c.name} {formData.categoryId === c.id && <Check className="h-3 w-3 text-slate-900" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center pr-1">
                <Label className={labelClass}>Expiry Date</Label>
                {formData.expiryDate && (
                  <button 
                    type="button" 
                    onClick={() => setFormData({ ...formData, expiryDate: "" })}
                    className="text-[9px] font-bold text-red-500 uppercase hover:text-red-700 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <Input type="date" className={inputClass} value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} />
            </div>
          </div>

          <div className="space-y-1">
            <Label className={labelClass}>Description</Label>
            <textarea placeholder="Short overview..." className={cn(inputClass, "h-14 py-2 resize-none")} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>
        </div>

        <div className="px-6 pb-6 pt-2">
          <Button onClick={handleSubmit} disabled={loading || !isValid} className="h-11 w-full rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-sm shadow-lg transition-all active:scale-[0.98]">
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Create Product"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}