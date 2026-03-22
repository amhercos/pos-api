import type { TransactionDetails } from "../types";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Printer, User, Calendar, CreditCard, X, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface ReceiptViewProps {
  data: TransactionDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReceiptView({ data, isOpen, onClose }: ReceiptViewProps) {
  if (!data) return null;

  const formatPHP = (val: number) => 
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      {/* Redesigned SheetContent: 
        1. Reduced outer border and shadow on the right for cleaner look.
        2. Switched from 'bg-slate-50' to 'bg-white' for a cleaner canvas.
      */}
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white p-0 border-l border-slate-100 shadow-xl z-50 [&>button]:hidden">
        
        {/* --- 1. Top Section & Header Layout --- */}
        <div className="pt-6 pb-2 border-b border-slate-100">
          <div className="px-6 flex items-center justify-between">
            {/* Added a single close button here */}
            <button 
              onClick={onClose} 
              className="rounded-full p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <Button 
                className="h-9 px-4 font-black uppercase text-[10px] tracking-widest text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 shadow-none rounded-xl" 
                variant="outline"
            >
              <Printer className="h-4 w-4 mr-1.5" /> Print Receipt
            </Button>
          </div>
          
          <div className="mt-8 px-6 pb-2">
            <h2 className="flex items-center gap-2 uppercase tracking-tighter text-3xl font-black text-slate-950">
              <ReceiptText className="h-7 w-7 text-blue-600" />
              Receipt Summary
            </h2>
            <p className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-9 mt-1">
              {data.id.slice(-12).toUpperCase()}
            </p>
          </div>
        </div>

        {/* --- 2. Main Content (Scrollable) --- */}
        {/* 👇 FIX 1: ADDED 'pr-8' TO GIVE SPACING TO THE RIGHT-HAND ELEMENTS 👇 */}
        <div className="py-6 pl-6 pr-8 space-y-6">
          
          {/* Metadata Section - Clean, integrated list style instead of a box */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</p>
                <p className="text-xs font-bold text-slate-700">
                  {new Date(data.transactionDate).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(data.transactionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-slate-400 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cashier / Seller</p>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">{data.userName}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-slate-400 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Method</p>
                <Badge 
                  variant={data.paymentType === 'Credit' ? 'outline' : 'default'} 
                  className={cn(
                    "text-[10px] font-black uppercase shadow-none px-3 py-1",
                    data.paymentType === 'Cash' ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100" : "bg-orange-50 text-orange-700 hover:bg-orange-50 border-orange-100"
                  )}
                >
                  {data.paymentType}
                </Badge>
              </div>
            </div>
          </div>

          <Separator className="border-slate-100" />

          {/* Purchased Items Section - Single subtle box */}
          <div className="bg-slate-50/50 rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-6">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-100">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Items ({data.items.length})</p>
            </div>
            <div className="divide-y divide-slate-100/50">
              {data.items.map((item, idx) => (
                <div key={idx} className="p-5 flex justify-between items-start hover:bg-slate-50 transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold tracking-tight text-slate-900">{item.productName}</p>
                    <p className="text-[10px] text-slate-500 font-medium tracking-tighter">
                      {item.quantity} x {formatPHP(item.unitPrice)}
                    </p>
                  </div>
                  <p className="text-sm font-black text-slate-950 tracking-tight">{formatPHP(item.subTotal)}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator className="border-slate-100" />

          {/* Calculation Section - Integrated summary instead of a big blue box */}
          <div className="bg-white px-1 pt-4 pb-6 space-y-4">
            <div className="flex justify-between items-center opacity-90">
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Total Amount</span>
              <span className="text-2xl font-black tracking-tight text-slate-950">{formatPHP(data.totalAmount)}</span>
            </div>
            
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span className="font-semibold">Cash Received</span>
              <span className="font-mono font-bold">{formatPHP(data.cashReceived)}</span>
            </div>
            
            <div className="flex justify-between items-center pt-3 border-t-2 border-slate-100">
              <span className="text-[11px] font-black uppercase tracking-widest text-blue-700">CHANGE</span>
              <span className="text-3xl font-black tracking-tighter text-slate-950">{formatPHP(data.changeAmount)}</span>
            </div>
          </div>
          
        </div>
      </SheetContent>
    </Sheet>
  );
}