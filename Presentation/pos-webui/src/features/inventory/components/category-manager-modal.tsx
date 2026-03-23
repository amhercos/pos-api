import { useState } from "react";
import { toast } from "sonner"; // 1. Added toast
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Trash2, FolderTree, Loader2 } from "lucide-react";
import { DeleteConfirmModal } from "@/components/shared/delete-confirm-modal"; // 2. Added your custom modal
import { getErrorMessage } from "@/lib/error-utils";
import type { Category } from "../types";

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAdd: (name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function CategoryManagerModal({ 
  isOpen, onClose, categories, onAdd, onDelete 
}: CategoryManagerProps) {
  const [newCategory, setNewCategory] = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  
  // 3. New state to track which category we want to delete
  const [confirmTarget, setConfirmTarget] = useState<Category | null>(null);

  const handleAdd = async () => {
    if (!newCategory.trim()) return;
    setLoadingAction("add");
    try {
      await onAdd(newCategory.trim());
      setNewCategory("");
      toast.success("Category added");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoadingAction(null);
    }
  };

  // 4. Updated Delete Logic (No window.confirm!)
  const handleConfirmedDelete = async () => {
    if (!confirmTarget) return;
    
    const target = confirmTarget;
    setConfirmTarget(null); // Close the confirmation modal
    setLoadingAction(`del-${target.id}`);
    
    const toastId = toast.loading(`Deleting ${target.name}...`);
    
    try {
      await onDelete(target.id);
      toast.success("Category deleted", { id: toastId });
    } catch (error) {
      toast.error(getErrorMessage(error), { id: toastId });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-105 p-0 rounded-[32px] border-none shadow-2xl bg-white outline-none overflow-hidden">
          {/* HEADER */}
          <div className="px-8 pt-8 pb-4 relative">
            <button onClick={onClose} className="absolute right-6 top-6 p-2 rounded-full hover:bg-slate-50 transition-colors text-slate-400">
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900 shadow-sm border border-slate-200/50">
                <FolderTree className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">Manage Categories</DialogTitle>
                <p className="text-[13px] font-medium text-slate-400">Organize your product groups</p>
              </div>
            </div>
          </div>

          {/* QUICK ADD SECTION */}
          <div className="px-8 py-4">
            <div className="flex gap-2 p-1.5 bg-slate-50/50 rounded-2xl border border-slate-100 focus-within:border-slate-300 transition-all">
              <input 
                placeholder="New category name..."
                className="flex-1 bg-transparent border-none outline-none px-3 text-sm font-semibold text-slate-700 placeholder:text-slate-400"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
              <Button 
                onClick={handleAdd}
                disabled={loadingAction === "add" || !newCategory.trim()}
                className="h-9 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all"
              >
                {loadingAction === "add" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Add"}
              </Button>
            </div>
          </div>

          {/* LIST SECTION */}
          <div className="px-6 pb-8">
            <div className="max-h-75 overflow-y-auto px-2 space-y-1">
              {categories.map((c) => (
                <div 
                  key={c.id} 
                  className="group flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-all"
                >
                  <span className="text-sm font-semibold text-slate-700 ml-1">{c.name}</span>
                  
                  <button 
                    type="button"
                    onClick={() => setConfirmTarget(c)} // 5. Trigger the custom modal
                    disabled={loadingAction === `del-${c.id}`}
                    className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200 opacity-0 group-hover:opacity-100 disabled:opacity-50"
                  >
                    {loadingAction === `del-${c.id}` ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 6. RENDER THE CUSTOM MODAL OUTSIDE THE MAIN DIALOG */}
      <DeleteConfirmModal 
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleConfirmedDelete}
        title="Delete Category"
        itemName={confirmTarget?.name || ""}
        isLoading={loadingAction?.startsWith('del-')}
      />
    </>
  );
}