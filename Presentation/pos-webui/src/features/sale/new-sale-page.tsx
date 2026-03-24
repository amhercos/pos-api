import { useState, useMemo, useCallback, useEffect } from "react";
import { useSale } from "./hooks/use-sale";
import { useInventory } from "../inventory/hooks/use-inventory";
import { useCredits } from "../credit/hooks/use-credits";
import { PaymentType } from "./types/transaction";
import { TransactionView } from "./components/transaction-view";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; 
import { Search, ShoppingCart, Loader2, Tag, Plus, Minus, Filter, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product as InventoryProduct } from "../inventory/types";
import type { CustomerCredit } from "../credit/types/credit";

export default function NewSalePage() {
  const { products, loading: isLoadingProducts } = useInventory();
  const { credits } = useCredits();
  const { basket, addToBasket, removeFromBasket, updateQuantity, checkout, isSubmitting } = useSale();

  const [search, setSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activePayment, setActivePayment] = useState<PaymentType>(PaymentType.Cash);
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [selectedCreditId, setSelectedCreditId] = useState<string>("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerContact, setNewCustomerContact] = useState("");

  const total = useMemo(() => basket.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0), [basket]);
  const change = Math.max(0, cashReceived - total);

  const categories = useMemo(() => {
    const pList = (products as InventoryProduct[]) || [];
    const uniqueCats = Array.from(new Set(pList.map(p => p.categoryName).filter(Boolean)));
    const sorted = uniqueCats.sort((a, b) => a.localeCompare(b));
    const list = ["All", ...sorted];
    return list.filter(cat => cat.toLowerCase().includes(categorySearch.toLowerCase()));
  }, [products, categorySearch]);

  const filteredProducts = useMemo(() => {
    const pList = (products as InventoryProduct[]) || [];
    return pList.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesCat = selectedCategory === "All" || p.categoryName === selectedCategory;
      return matchesSearch && matchesCat;
    }).slice(0, 80);
  }, [products, debouncedSearch, selectedCategory]);

  const handleCheckout = useCallback(async () => {
    if (basket.length === 0) return;
    const success = await checkout({
      items: basket.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })),
      paymentType: activePayment,
      totalAmount: total,
      cashReceived: activePayment === PaymentType.Cash ? cashReceived : 0,
      changeAmount: activePayment === PaymentType.Cash ? change : 0,
      customerCreditId: (!isNewCustomer && activePayment === PaymentType.Credit) ? selectedCreditId : undefined,
      newCustomerName: (isNewCustomer && activePayment === PaymentType.Credit) ? newCustomerName : undefined,
      newCustomerContact: (isNewCustomer && activePayment === PaymentType.Credit) ? newCustomerContact : undefined,
    });
    if (success) { setIsSheetOpen(false); setCashReceived(0); setSelectedCreditId(""); }
  }, [basket, activePayment, cashReceived, total, change, isNewCustomer, selectedCreditId, newCustomerName, newCustomerContact, checkout]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(timer);
  }, [search]);

  const transactionProps = {
    basket, activePayment, setActivePayment, cashReceived, setCashReceived,
    total, change, isSubmitting, handleCheckout, updateQuantity, removeFromBasket,
    credits: (credits as CustomerCredit[]) || [], 
    selectedCreditId, setSelectedCreditId, isNewCustomer, setIsNewCustomer,
    newCustomerName, setNewCustomerName, newCustomerContact, setNewCustomerContact
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      <section className="flex-1 flex flex-col bg-white border-r min-w-0 relative">
        <header className="px-3 pt-1 pb-2 border-b space-y-1.5 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search items..." className="pl-9 h-9 bg-slate-100 border-none rounded-lg text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="relative w-28 shrink-0">
              <Filter className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
              <input 
                placeholder="Find category..." 
                className="w-full pl-6 pr-2 h-8 text-[10px] font-bold bg-slate-50 border rounded-md focus:outline-none" 
                value={categorySearch} 
                onChange={(e) => setCategorySearch(e.target.value)} 
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex items-center gap-1.5 pb-1">
                <Tag className="h-3 w-3 text-slate-300 shrink-0" />
                {categories.map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase", selectedCategory === cat ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500")}>
                    {cat}
                  </button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="hidden" />
            </ScrollArea>
          </div>
        </header>

        <ScrollArea className="flex-1 p-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2 pb-60 lg:pb-5">
            {isLoadingProducts ? (
              <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" /></div>
            ) : filteredProducts.map(p => (
              <button 
                key={p.id} 
                disabled={p.stockQuantity <= 0} 
                onClick={() => addToBasket({ id: p.id, name: p.name, price: p.price, stock: p.stockQuantity, categoryName: p.categoryName || "Uncategorized" })} 
                className={cn("p-3 bg-white border rounded-xl text-left h-24 flex flex-col transition-all active:scale-95 shadow-sm", p.stockQuantity <= 0 && "opacity-30 grayscale")}
              >
                <div className="flex items-center gap-1 mb-1">
                  <div className={cn("w-1.5 h-1.5 rounded-full", p.stockQuantity < 5 ? "bg-red-500" : "bg-emerald-500")} />
                  <span className="text-[9px] font-black text-slate-400 uppercase">{p.stockQuantity} Stock</span>
                </div>
                <p className="font-bold text-slate-800 text-[11px] line-clamp-2 leading-tight uppercase">{p.name}</p>
                <p className="mt-auto font-black text-blue-600 text-sm">₱{p.price.toLocaleString()}</p>
              </button>
            ))}
          </div>
        </ScrollArea>

        {/* IPAD/MOBILE LIFO FOOTER STACK */}
        <div className="lg:hidden absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t p-3 pb-6 flex flex-col gap-2 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-30">
          {basket.length > 0 && (
            <div className="flex flex-col -space-y-3 mb-2">
              {[...basket].reverse().slice(0, 3).map((item, idx) => (
                <div 
                  key={item.productId} 
                  style={{ zIndex: 30 - idx, transform: `scale(${1 - idx * 0.04})`, marginTop: idx > 0 ? '-10px' : '0' }}
                  className={cn("flex items-center justify-between bg-white p-2.5 rounded-xl border shadow-sm", idx === 0 ? "border-blue-200" : "border-slate-200 opacity-80")}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button onClick={(e) => { e.stopPropagation(); removeFromBasket(item.productId); }} className="p-1.5 bg-red-50 text-red-500 rounded-lg"><Trash2 className="h-3.5 w-3.5" /></button>
                    <div className="flex flex-col truncate">
                      <span className="text-[10px] font-black uppercase truncate">{item.name}</span>
                      <span className="text-[9px] font-bold text-blue-600">₱{(item.unitPrice * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center bg-slate-100 rounded-lg border ml-2">
                    <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 px-2"><Minus className="h-3 w-3" /></button>
                    <span className="px-1 text-[10px] font-black">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 px-2"><Plus className="h-3 w-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button className="h-12 w-full rounded-2xl bg-blue-600 shadow-lg flex items-center justify-between px-6 active:scale-95 transition-transform">
                <div className="flex items-center gap-2 text-white font-black text-[11px] uppercase tracking-widest"><ShoppingCart className="h-4 w-4" /> Review Order</div>
                <div className="bg-white/20 px-3 py-1 rounded-lg font-black text-xs text-white border border-white/10">₱{total.toLocaleString()}</div>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[94vh] p-0 rounded-t-[2.5rem] border-none overflow-hidden">
              <TransactionView {...transactionProps} />
            </SheetContent>
          </Sheet>
        </div>
      </section>

      {/* DESKTOP/IPAD SIDEBAR */}
      <aside className="hidden lg:flex w-96 flex-col bg-white h-full border-l shadow-2xl z-20 shrink-0">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50 shrink-0">
          <div className="flex items-center gap-2 font-black text-[10px] uppercase text-slate-500"><ShoppingCart className="h-4 w-4 text-blue-600" /> {basket.length} ITEMS (NEWEST TOP)</div>
          <Button variant="ghost" size="sm" onClick={() => { if(window.confirm("Void?")) basket.forEach(i => removeFromBasket(i.productId)) }} className="h-7 text-[10px] font-black text-slate-400 hover:text-red-500">VOID ALL</Button>
        </div>
        <TransactionView {...transactionProps} />
      </aside>
    </div>
  );
}