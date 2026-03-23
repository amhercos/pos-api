import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCog, X, Loader2 } from "lucide-react";
import type { CustomerCredit } from "../types/credit";

interface EditCreditModalProps {
  credit: CustomerCredit | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, contact: string) => Promise<void>;
}

export function EditCreditModal({ credit, isOpen, onClose, onConfirm }: EditCreditModalProps) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (credit) {
      setName(credit.customerName);
      setContact(credit.contactInfo || "");
    }
  }, [credit, isOpen]);

  const handleSubmit = async () => {
    if (!credit || !name.trim()) return;
    setIsSubmitting(true);
    try {
      await onConfirm(name, contact);
      onClose();
    } catch { 
      /* Error handled by hook */ 
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-7 rounded-[28px] border-none shadow-2xl bg-white overflow-hidden">
        <DialogClose asChild>
          <button className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </DialogClose>
        
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <UserCog className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-semibold tracking-tight text-slate-900">
              Customer Details
            </DialogTitle>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">
                Full Name
              </Label>
              <Input 
                placeholder="Enter customer name"
                className="h-11 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-[13px]" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">
                Contact Information
              </Label>
              <Input 
                placeholder="Phone or Email"
                className="h-11 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-[13px]" 
                value={contact} 
                onChange={(e) => setContact(e.target.value)} 
              />
            </div>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !name.trim()} 
            className="w-full h-11 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[13px] shadow-lg shadow-slate-100 transition-all active:scale-95"
          >
            {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}