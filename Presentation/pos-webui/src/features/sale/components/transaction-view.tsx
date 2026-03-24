import { useState, useMemo, useRef } from "react";
import { 
  Trash2, Plus, Minus, CreditCard, Banknote, 
  ArrowRight, User, Phone, Check, ChevronDown, ShoppingCart, Loader2 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PaymentType, type BasketItem } from "../types/transaction";
import { type CustomerCredit } from "../../credit/types/credit";
import { cn } from "@/lib/utils";

const COMMON_DENOMINATIONS = [20, 50, 100, 200, 500, 1000];

interface TransactionViewProps {
  basket: BasketItem[];
  activePayment: PaymentType;
  setActivePayment: (p: PaymentType) => void;
  cashReceived: number;
  setCashReceived: (n: number | ((prev: number) => number)) => void;
  total: number;
  change: number;
  isSubmitting: boolean;
  handleCheckout: () => void;
  updateQuantity: (id: string, q: number) => void;
  removeFromBasket: (id: string) => void;
  credits: CustomerCredit[];
  selectedCreditId: string;
  setSelectedCreditId: (s: string) => void;
  isNewCustomer: boolean;
  setIsNewCustomer: (b: boolean) => void;
  newCustomerName: string;
  setNewCustomerName: (s: string) => void;
  newCustomerContact: string;
  setNewCustomerContact: (s: string) => void;
}

export const TransactionView = (props: TransactionViewProps) => {
  const [isCreditDropdownOpen, setIsCreditDropdownOpen] = useState(false);
  const [creditSearch, setCreditSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // RECENT ON TOP: Reverse the basket items for the "Stack" design
  const stackedBasket = useMemo(() => [...props.basket].reverse(), [props.basket]);

  const filteredCredits = useMemo(() => {
    return (props.credits || []).filter(c => 
      c.customerName.toLowerCase().includes(creditSearch.toLowerCase())
    ).slice(0, 5);
  }, [props.credits, creditSearch]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* SCROLLABLE BASKET AREA */}
      <ScrollArea className="flex-1 overflow-y-auto">
        {/* pt-12 provides space for the mobile sheet handle/X button */}
        <div className="p-4 pt-12 lg:pt-4 space-y-2">
          {stackedBasket.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center opacity-10">
              <ShoppingCart className="h-12 w-12 mb-2" />
              <p className="text-[10px] font-black uppercase">Basket is Empty</p>
            </div>
          ) : (
            stackedBasket.map((item, idx) => (
              <div 
                key={item.productId} 
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all",
                  idx === 0 ? "bg-blue-50/50 border-blue-100 shadow-sm" : "bg-slate-50 border-slate-100"
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-800 uppercase truncate">{item.name}</p>
                  <p className="text-[10px] font-black text-blue-600">₱{item.unitPrice.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-1 bg-white rounded-lg p-0.5 border">
                  <button onClick={() => props.updateQuantity(item.productId, -1)} className="p-1.5 hover:bg-slate-50 rounded"><Minus className="h-3 w-3" /></button>
                  <span className="text-xs font-black w-6 text-center">{item.quantity}</span>
                  <button onClick={() => props.updateQuantity(item.productId, 1)} className="p-1.5 hover:bg-slate-50 rounded"><Plus className="h-3 w-3" /></button>
                </div>
                <button 
                  onClick={() => props.removeFromBasket(item.productId)} 
                  className="text-slate-300 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* FIXED FOOTER AREA */}
      <footer className="border-t bg-slate-50 p-4 space-y-3 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex p-1 bg-slate-200/50 rounded-xl">
          <button 
            className={cn("flex-1 py-2 rounded-lg text-[10px] font-black flex items-center justify-center gap-2 transition-all", props.activePayment === PaymentType.Cash ? "bg-white text-blue-600 shadow-sm" : "text-slate-500")} 
            onClick={() => props.setActivePayment(PaymentType.Cash)}
          >
            <Banknote className="h-3.5 w-3.5" /> CASH
          </button>
          <button 
            className={cn("flex-1 py-2 rounded-lg text-[10px] font-black flex items-center justify-center gap-2 transition-all", props.activePayment === PaymentType.Credit ? "bg-white text-blue-600 shadow-sm" : "text-slate-500")} 
            onClick={() => props.setActivePayment(PaymentType.Credit)}
          >
            <CreditCard className="h-3.5 w-3.5" /> CREDIT
          </button>
        </div>

        {props.activePayment === PaymentType.Cash ? (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-1">
              {COMMON_DENOMINATIONS.slice(3).map(amt => (
                <button key={amt} onClick={() => props.setCashReceived(prev => prev + amt)} className="py-2 bg-white border rounded-lg text-[10px] font-bold hover:border-blue-500 transition-colors">+₱{amt}</button>
              ))}
            </div>
            <Input type="number" className="h-12 bg-white font-black text-right text-xl text-blue-600 border-2 rounded-xl" value={props.cashReceived || ""} onChange={(e) => props.setCashReceived(Number(e.target.value))} />
          </div>
        ) : (
          <div className="space-y-2" ref={dropdownRef}>
             <div className="flex justify-between px-1"><span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Debtor</span><button onClick={() => props.setIsNewCustomer(!props.isNewCustomer)} className="text-[10px] font-black text-blue-600 uppercase underline decoration-2 underline-offset-4">{props.isNewCustomer ? "Select Existing" : "+ New Customer"}</button></div>
             {props.isNewCustomer ? (
               <div className="grid grid-cols-2 gap-2">
                 <div className="relative"><User className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400"/><Input placeholder="Name" className="h-10 text-xs pl-7 rounded-xl" value={props.newCustomerName} onChange={(e) => props.setNewCustomerName(e.target.value)} /></div>
                 <div className="relative"><Phone className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400"/><Input placeholder="Contact" className="h-10 text-xs pl-7 rounded-xl" value={props.newCustomerContact} onChange={(e) => props.setNewCustomerContact(e.target.value)} /></div>
               </div>
             ) : (
               <div className="relative">
                 <button onClick={() => setIsCreditDropdownOpen(!isCreditDropdownOpen)} className="w-full h-11 bg-white border rounded-xl px-4 flex items-center justify-between text-xs font-bold shadow-sm">
                   <span className="truncate">{props.credits.find(c => c.id === props.selectedCreditId)?.customerName || "Select Debtor..."}</span>
                   <ChevronDown className={cn("h-4 w-4 transition-transform", isCreditDropdownOpen && "rotate-180")} />
                 </button>
                 {isCreditDropdownOpen && (
                    <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border rounded-xl shadow-2xl z-50 flex flex-col max-h-48 overflow-hidden">
                      <div className="p-2 border-b bg-slate-50"><Input placeholder="Search..." className="h-8 text-xs rounded-lg" value={creditSearch} onChange={(e) => setCreditSearch(e.target.value)} /></div>
                      <ScrollArea className="flex-1">
                        {filteredCredits.map(c => (
                          <button key={c.id} onClick={() => { props.setSelectedCreditId(c.id); setIsCreditDropdownOpen(false); }} className="w-full p-3 hover:bg-blue-50 text-xs font-bold border-b last:border-0 flex justify-between items-center transition-colors">
                            {c.customerName}
                            {props.selectedCreditId === c.id && <Check className="h-3 w-3 text-blue-600" />}
                          </button>
                        ))}
                      </ScrollArea>
                    </div>
                 )}
               </div>
             )}
          </div>
        )}

        <div className="pt-2 border-t flex flex-col gap-1">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Due Total</span>
            <span className="text-3xl font-black text-slate-900 leading-none">₱{props.total.toLocaleString()}</span>
          </div>
          {props.activePayment === PaymentType.Cash && props.cashReceived > props.total && (
            <div className="flex justify-between items-center text-emerald-600">
               <span className="text-[10px] font-black uppercase tracking-tighter">Change</span>
               <span className="text-lg font-black">₱{props.change.toLocaleString()}</span>
            </div>
          )}
        </div>
        
        <Button 
          className="w-full h-14 rounded-xl bg-slate-900 text-white font-black hover:bg-blue-600 transition-all shadow-xl flex items-center justify-between px-6" 
          disabled={props.isSubmitting || props.basket.length === 0} 
          onClick={props.handleCheckout}
        >
          {props.isSubmitting ? <Loader2 className="animate-spin mx-auto h-5 w-5" /> : <><span className="text-xs tracking-[0.2em]">FINALIZE TRANSACTION</span><ArrowRight className="h-5 w-5"/></>}
        </Button>
      </footer>
    </div>
  );
};