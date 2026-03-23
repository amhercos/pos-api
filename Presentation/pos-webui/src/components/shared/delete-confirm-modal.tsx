import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react"; 

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  isLoading?: boolean;
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, itemName, isLoading }: DeleteConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isLoading && !open && onClose()}>
      {/* High z-index to stay above the Category Manager */}
      <DialogContent className="sm:max-w-[380px] p-0 rounded-[32px] border-none shadow-2xl bg-white outline-none overflow-hidden z-[100]">
        <div className="p-8 flex flex-col items-center text-center">
          
          {/* Main Warning Icon */}
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-red-500 mb-6 animate-in zoom-in-50 duration-300">
            <AlertTriangle className="h-10 w-10 stroke-[1.5]" />
          </div>

          <DialogTitle className="text-2xl font-bold text-slate-900 mb-2">
            {title}
          </DialogTitle>
          
          <DialogDescription className="text-[14px] font-medium text-slate-500 leading-relaxed px-2">
            Are you sure you want to remove <span className="text-slate-900 font-bold italic">"{itemName}"</span>? 
            This action is permanent and cannot be undone.
          </DialogDescription>

          <div className="flex flex-col w-full gap-3 mt-8">
            <Button 
              onClick={onConfirm}
              disabled={isLoading}
              className="h-14 w-full rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                  <span>Deleting...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" /> {/* Trash2 is now used here! */}
                  <span>Confirm Delete</span>
                </div>
              )}
            </Button>

            <Button 
              variant="ghost" 
              onClick={onClose} 
              disabled={isLoading}
              className="h-14 w-full rounded-2xl text-slate-500 font-bold hover:bg-slate-50 transition-all"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}