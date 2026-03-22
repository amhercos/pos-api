import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, X, Settings2, Plus } from "lucide-react";
import { DeleteConfirmModal } from "@/components/shared/delete-confirm-modal";
import { getErrorMessage } from "@/lib/error-utils";
import type { Category } from "../types";

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAdd: (name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function CategoryManagerModal({ 
  isOpen, 
  onClose, 
  categories, 
  onAdd, 
  onDelete 
}: CategoryManagerModalProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newCategoryName.trim();
    if (!trimmedName || isAdding) return;

    setIsAdding(true);
    try {
      await onAdd(trimmedName);
      setNewCategoryName("");
      toast.success("Category added successfully");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsAdding(false);
    }
  };

  const handleConfirmedDelete = async () => {
    if (!confirmTarget) return;
    
    const target = confirmTarget; // Snapshot before clearing state
    setConfirmTarget(null); // Close the confirm modal immediately
    setIsDeleting(true);
    
    const toastId = toast.loading(`Deleting ${target.name}...`);

    try {
      await onDelete(target.id);
      toast.success("Category deleted successfully", { id: toastId });
    } catch (error: unknown) {
      toast.dismiss(toastId); // Remove loading toast
      toast.error(getErrorMessage(error), { duration: 5000 });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog 
        open={isOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setNewCategoryName("");
            onClose();
          }
        }}
      >
        <DialogContent className="sm:max-w-[420px] p-0 rounded-[32px] border-none shadow-2xl bg-white overflow-hidden z-40">
          <DialogClose asChild>
            <button className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </DialogClose>

          <div className="px-8 pt-10 pb-6 flex flex-col items-center text-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl">
              <Settings2 className="h-7 w-7" />
            </div>
            <DialogTitle className="text-2xl font-bold text-slate-900">Categories</DialogTitle>
          </div>

          <form onSubmit={handleAdd} className="px-8 mb-6 flex gap-2">
            <Input 
              placeholder="New category..." 
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="rounded-2xl bg-slate-50 border-slate-100"
            />
            <Button type="submit" disabled={isAdding || !newCategoryName.trim()} className="rounded-xl bg-slate-900">
              {isAdding ? <div className="h-4 w-4 border-2 border-white/30 border-t-white animate-spin rounded-full" /> : <Plus className="h-4 w-4" />}
            </Button>
          </form>

          <div className="px-6 pb-8 max-h-[300px] overflow-y-auto scrollbar-hide">
            <div className="space-y-2 pt-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white transition-all">
                  <span className="font-semibold text-slate-700 text-sm">{category.name}</span>
                  <button
                    type="button"
                    onClick={() => setConfirmTarget(category)}
                    className="p-2 text-slate-300 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* RENDERED OUTSIDE PRIMARY DIALOG */}
      <DeleteConfirmModal 
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleConfirmedDelete}
        title="Delete Category"
        itemName={confirmTarget?.name || ""}
        isLoading={isDeleting}
      />
    </>
  );
}