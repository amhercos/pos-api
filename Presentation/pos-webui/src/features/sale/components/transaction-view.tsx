import { useState, useMemo } from "react";
import { 
  Plus, Minus, CreditCard, Banknote, 
  ArrowRight, Check, ChevronDown, ShoppingCart, Loader2, X, AlertTriangle 
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
  clearBasket: () => void; 
  credits: CustomerCredit[];
  selectedCreditId: string;
  setSelectedCreditId: (s: string) => void;
  isNewCustomer: boolean;
  setIsNewCustomer: (b: boolean) => void;
  newCustomerName: string;
  setNewCustomerName: (s: string) => void;
  newCustomerContact: string;
  setNewCustomerContact: (s: string) => void;
  onClose?: () => void;
}

export const TransactionView = (props: TransactionViewProps) => {
  const [isCreditDropdownOpen, setIsCreditDropdownOpen] = useState(false);
  const [creditSearch, setCreditSearch] = useState("");
  const [showVoidConfirm, setShowVoidConfirm] = useState(false);

  const stackedBasket = useMemo(() => [...props.basket].reverse(), [props.basket]);

  const filteredCredits = useMemo(() => {
    return (props.credits || []).filter(c => 
      c.customerName.toLowerCase().includes(creditSearch.toLowerCase())
    ).slice(0, 5);
  }, [props.credits, creditSearch]);

  const handleVoidAll = () => {
    props.clearBasket();
    setShowVoidConfirm(false);
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden relative">
      
      {/* CUSTOM VOID MODAL */}
      {showVoidConfirm && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[320px] rounded-[2.5rem] p-8 shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <div className="h-16 w-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-rose-500" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 mb-2">Void All?</h3>
            <p className="text-xs font-bold text-slate-400 leading-relaxed mb-8 uppercase tracking-wide">
              You are about to clear {props.basket.length} items from the basket.
            </p>
            <div className="space-y-2">
              <Button 
                onClick={handleVoidAll}
                className="w-full h-12 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold border-none text-[10px] tracking-widest uppercase"
              >
                Clear Everything
              </Button>
              <Button 
                onClick={() => setShowVoidConfirm(false)}
                variant="ghost"
                className="w-full h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold border-none text-[10px] tracking-widest uppercase"
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between p-5 border-b border-slate-50 bg-white shrink-0">
        <div className="flex flex-col">
          <h2 className="text-sm font-black uppercase tracking-tight text-slate-900 lg:hidden">Review Order</h2>
          <span className="hidden lg:block font-bold text-[10px] uppercase tracking-widest text-slate-400">Basket Summary</span>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest lg:hidden">{props.basket.length} Items Total</p>
        </div>

        <div className="flex items-center gap-2">
          {props.basket.length > 0 && (
            <button 
              type="button"
              onClick={() => setShowVoidConfirm(true)}
              className="text-[10px] font-bold text-slate-300 hover:text-rose-500 uppercase transition-colors px-2 py-1"
            >
              Void All
            </button>
          )}

          <button 
            type="button"
            onClick={props.onClose} 
            className="lg:hidden h-10 w-10 flex items-center justify-center bg-slate-100 rounded-full active:scale-90 transition-transform"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* BASKET ITEMS */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
        {stackedBasket.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center opacity-20">
            <ShoppingCart className="h-8 w-8 mb-2" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Empty Basket</p>
          </div>
        ) : (
          stackedBasket.map((item, idx) => (
            <div 
              key={item.productId} 
              className={cn(
                "flex items-center gap-3 p-3 rounded-2xl transition-all border border-transparent",
                idx === 0 ? "bg-slate-800 text-white shadow-md" : "bg-slate-50 text-slate-900"
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold uppercase truncate leading-tight tracking-tight">{item.name}</p>
                <p className={cn("text-[10px] font-medium mt-0.5", idx === 0 ? "text-slate-400" : "text-slate-500")}>
                  ₱{item.unitPrice.toLocaleString()}
                </p>
              </div>
              <div className={cn("flex items-center gap-1 rounded-xl p-0.5", idx === 0 ? "bg-white/10" : "bg-white border border-slate-100 shadow-sm")}>
                <button type="button" onClick={() => props.updateQuantity(item.productId, -1)} className="p-1 hover:bg-black/5 rounded-lg"><Minus className="h-3 w-3" /></button>
                <span className="text-[11px] font-bold w-5 text-center">{item.quantity}</span>
                <button type="button" onClick={() => props.updateQuantity(item.productId, 1)} className="p-1 hover:bg-black/5 rounded-lg"><Plus className="h-3 w-3" /></button>
              </div>
              <button type="button" onClick={() => props.removeFromBasket(item.productId)} className={cn("p-1 transition-opacity", idx === 0 ? "text-white/40 hover:text-white" : "text-slate-300 hover:text-rose-500")}>
                <X className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* PAYMENT CONTROLS */}
      <div className="shrink-0 border-t border-slate-100 bg-white p-5 space-y-4 pb-10 lg:pb-5 shadow-[0_-15px_40px_rgba(0,0,0,0.04)]">
        <div className="flex p-1 bg-slate-100 rounded-2xl">
          <button 
            type="button"
            className={cn("flex-1 py-2.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 transition-all", props.activePayment === PaymentType.Cash ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")} 
            onClick={() => props.setActivePayment(PaymentType.Cash)}
          >
            <Banknote className="h-3.5 w-3.5" /> CASH
          </button>
          <button 
            type="button"
            className={cn("flex-1 py-2.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 transition-all", props.activePayment === PaymentType.Credit ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")} 
            onClick={() => props.setActivePayment(PaymentType.Credit)}
          >
            <CreditCard className="h-3.5 w-3.5" /> CREDIT
          </button>
        </div>

        {props.activePayment === PaymentType.Cash && (
          <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between px-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Quick Denominations
              </span>
              <button 
                type="button"
                onClick={() => props.setCashReceived(0)}
                className="text-[9px] font-bold text-rose-500 uppercase hover:underline"
              >
                Clear Amount
              </button>
            </div>

            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {COMMON_DENOMINATIONS.map(amt => (
                <button 
                  key={amt} 
                  type="button"
                  onClick={() => props.setCashReceived((prev: number) => (prev || 0) + amt)} 
                  className="px-3 py-2 bg-slate-50 text-[10px] font-bold rounded-xl border border-slate-100 active:scale-95 transition-transform shrink-0"
                >
                  +{amt}
                </button>
              ))}
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">₱</span>
              <Input 
                type="number" 
                className="h-14 bg-slate-50 border-none font-black text-right text-2xl rounded-2xl focus-visible:ring-2 focus-visible:ring-slate-900 transition-all" 
                value={props.cashReceived === 0 ? "" : props.cashReceived} 
                placeholder="0.00"
                onChange={(e) => {
                  const val = e.target.value;
                  props.setCashReceived(val === "" ? 0 : Number(val));
                }} 
                onFocus={(e) => e.target.select()} 
              />
            </div>
          </div> 
        )}

        {props.activePayment === PaymentType.Credit && (
          <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
            <div className="flex justify-between px-1 items-center mb-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Debtor</span>
              <button 
                type="button"
                onClick={() => props.setIsNewCustomer(!props.isNewCustomer)} 
                className="text-[9px] font-bold text-blue-600 uppercase"
              >
                {props.isNewCustomer ? "Cancel" : "New +"}
              </button>
            </div>
            {props.isNewCustomer ? (
              <div className="grid grid-cols-1 gap-2">
                <Input placeholder="Name" className="h-11 text-xs bg-slate-50 border-none rounded-xl" value={props.newCustomerName} onChange={(e) => props.setNewCustomerName(e.target.value)} />
                <Input placeholder="Contact" className="h-11 text-xs bg-slate-50 border-none rounded-xl" value={props.newCustomerContact} onChange={(e) => props.setNewCustomerContact(e.target.value)} />
              </div>
            ) : (
              <div className="relative">
                <button 
                  type="button"
                  onClick={() => setIsCreditDropdownOpen(!isCreditDropdownOpen)} 
                  className="w-full h-11 bg-slate-50 rounded-xl px-4 flex items-center justify-between text-xs font-semibold text-slate-700"
                >
                  <span className="truncate">{props.credits.find(c => c.id === props.selectedCreditId)?.customerName || "Select customer..."}</span>
                  <ChevronDown className={cn("h-4 w-4 opacity-30 transition-transform", isCreditDropdownOpen && "rotate-180")} />
                </button>
                {isCreditDropdownOpen && (
                  <div className="absolute bottom-full mb-3 left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-2 bg-slate-50/50">
                      <Input 
                        placeholder="Search..." 
                        className="h-8 text-xs rounded-lg border-none bg-white" 
                        value={creditSearch} 
                        onChange={(e) => setCreditSearch(e.target.value)} 
                      />
                    </div>
                    <ScrollArea className="max-h-40">
                      {filteredCredits.length === 0 ? (
                        <p className="p-4 text-[10px] text-center text-slate-400 font-bold uppercase">No results</p>
                      ) : (
                        filteredCredits.map(c => (
                          <button 
                            key={c.id} 
                            type="button"
                            onClick={() => { props.setSelectedCreditId(c.id); setIsCreditDropdownOpen(false); }} 
                            className="w-full p-3 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex justify-between items-center transition-colors"
                          >
                            {c.customerName}
                            {props.selectedCreditId === c.id && <Check className="h-3 w-3" />}
                          </button>
                        ))
                      )}
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="pt-2">
          <div className="flex justify-between items-end px-1 mb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
            <div className="text-right">
              <p className="text-3xl font-bold leading-none tracking-tighter">₱{props.total.toLocaleString()}</p>
              {props.activePayment === PaymentType.Cash && props.cashReceived > props.total && (
                <p className="text-[11px] font-bold text-emerald-500 mt-1 uppercase tracking-tight animate-in fade-in slide-in-from-bottom-1">
                  Change: ₱{props.change.toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <Button 
            className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all active:scale-[0.97] shadow-xl flex items-center justify-between px-8" 
            disabled={props.isSubmitting || props.basket.length === 0 || (props.activePayment === PaymentType.Cash && props.cashReceived < props.total)} 
            onClick={props.handleCheckout}
          >
            {props.isSubmitting ? (
              <Loader2 className="animate-spin mx-auto h-5 w-5" /> 
            ) : (
              <>
                <span className="text-xs tracking-widest uppercase">Finalize Sale</span>
                <ArrowRight className="h-5 w-5 opacity-50"/>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};