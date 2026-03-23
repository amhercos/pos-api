import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, X, Loader2 } from "lucide-react";
import type { CustomerCredit } from "../types/credit";

interface PayCreditModalProps {
  credit: CustomerCredit | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amountPaid: number) => Promise<void>;
}

export function PayCreditModal({ credit, isOpen, onClose, onConfirm }: PayCreditModalProps) {
  const [amountPaid, setAmountPaid] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset input when modal closes or customer changes
  useEffect(() => {
    if (!isOpen) setAmountPaid("");
  }, [isOpen]);

  const handleSubmit = async () => {
    const numAmount = Number(amountPaid);
    
    // Basic validation
    if (!credit || numAmount <= 0) return;

    setIsSubmitting(true);
    try {
      await onConfirm(numAmount);
      onClose();
    } catch { 
      /* Error handled by hook toasts */ 
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOverpaying = credit ? Number(amountPaid) > credit.creditAmount : false;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-8 rounded-3xl border-none shadow-2xl bg-white overflow-hidden">
        <DialogClose asChild>
          <button className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-900 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </DialogClose>

        <div className="text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <Wallet className="h-6 w-6" />
          </div>
          
          <DialogTitle className="text-xl font-bold text-slate-900">Record Payment</DialogTitle>
          
          <div className="space-y-4 text-left pt-4">
            <div>
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                Payment for {credit?.customerName}
              </Label>
              <Input 
                type="number" 
                placeholder="0.00" 
                className={`h-12 rounded-2xl mt-1 font-semibold ${isOverpaying ? 'border-amber-500 focus-visible:ring-amber-500' : 'border-slate-200'}`}
                value={amountPaid} 
                onChange={(e) => setAmountPaid(e.target.value)} 
              />
              {credit && (
                <div className="flex justify-between mt-2 px-1">
                  <span className="text-[11px] text-slate-400 italic">
                    Current Balance: ₱{credit.creditAmount.toLocaleString()}
                  </span>
                  {isOverpaying && (
                    <span className="text-[11px] font-bold text-amber-600 uppercase tracking-tighter">
                      Overpayment detected
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !amountPaid || Number(amountPaid) <= 0} 
            className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all font-bold"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              `Confirm ₱${Number(amountPaid).toLocaleString() || '0'} Payment`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}