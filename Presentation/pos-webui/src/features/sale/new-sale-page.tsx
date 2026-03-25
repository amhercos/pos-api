import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSale } from "./hooks/use-sale";
import { useInventory } from "../inventory/hooks/use-inventory";
import { useCredits } from "../credit/hooks/use-credits";
import { PaymentType } from "./types/transaction";
import { TransactionView } from "./components/transaction-view";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; 
import { Search, ShoppingCart, Loader2, Filter, Trash2, Plus, Minus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Product as InventoryProduct } from "../inventory/types";
import type { CustomerCredit } from "../credit/types/credit";

export default function NewSalePage() {
  const { products, loading: isLoadingProducts, hasMore, fetchMore, refresh } = useInventory();
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

  const [currentPage, setCurrentPage] = useState(1);
  const observerTarget = useRef<HTMLDivElement>(null);

  // --- RENDER-PHASE FILTER SYNC (Replaces the broken Effect) ---
  const [prevFilters, setPrevFilters] = useState({ search: "", cat: "All" });

  if (prevFilters.search !== debouncedSearch || prevFilters.cat !== selectedCategory) {
    setPrevFilters({ search: debouncedSearch, cat: selectedCategory });
    setCurrentPage(1);
    refresh();
  }

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingProducts) {
          setCurrentPage((prev) => {
            const nextPage = prev + 1;
            fetchMore(nextPage);
            return nextPage;
          });
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingProducts, fetchMore]);

  const total = useMemo(() => basket.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0), [basket]);
  const change = Math.max(0, cashReceived - total);
  const recentItems = useMemo(() => [...basket].reverse().slice(0, 3), [basket]);

  const clearBasket = useCallback(() => {
    basket.forEach(item => removeFromBasket(item.productId));
  }, [basket, removeFromBasket]);

  const categories = useMemo(() => {
    const pList = (products as InventoryProduct[]) || [];
    const uniqueCats = Array.from(new Set(pList.map(p => p.categoryName || "Uncategorized")));
    const list = ["All", ...uniqueCats.sort().filter(c => c !== "Uncategorized"), ...(uniqueCats.includes("Uncategorized") ? ["Uncategorized"] : [])];
    return list.filter(cat => cat.toLowerCase().includes(categorySearch.toLowerCase()));
  }, [products, categorySearch]);

  const filteredProducts = useMemo(() => {
    const pList = (products as InventoryProduct[]) || [];
    return pList.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesCat = selectedCategory === "All" || (p.categoryName || "Uncategorized") === selectedCategory;
      return matchesSearch && matchesCat;
    });
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

  const transactionProps = {
    basket, activePayment, setActivePayment, cashReceived, setCashReceived,
    total, change, isSubmitting, handleCheckout, updateQuantity, removeFromBasket,
    clearBasket, credits: (credits as CustomerCredit[]) || [], 
    selectedCreditId, setSelectedCreditId, isNewCustomer, setIsNewCustomer,
    newCustomerName, setNewCustomerName, newCustomerContact, setNewCustomerContact
  };

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden font-sans antialiased">
      {/* LEFT SECTION (Products) - min-w-0 prevents it from pushing outside bounds */}
      <section className="flex-1 flex flex-col min-w-0 bg-white border-r border-slate-50 relative">
        
        {/* HEADER: fixed height */}
        <header className="flex-none px-4 py-3 border-b border-slate-50 space-y-3 bg-white z-20">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
              <Input 
                placeholder="Search items..." 
                className="pl-9 h-10 bg-slate-50 border-none rounded-xl text-xs w-full" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
            <div className="relative w-32 shrink-0">
               <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-300" />
               <input 
                 placeholder="Category..." 
                 className="w-full pl-8 h-8 text-[10px] font-semibold bg-slate-50 border-none rounded-lg focus:outline-none" 
                 value={categorySearch} 
                 onChange={(e) => setCategorySearch(e.target.value)} 
               />
            </div>
          </div>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex items-center gap-1.5 pb-1">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setSelectedCategory(cat)} 
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[9px] font-bold uppercase transition-all", 
                    selectedCategory === cat ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </ScrollArea>
        </header>

        {/* PRODUCT GRID: The actual scrollable area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
          <TooltipProvider delayDuration={300}>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 pb-44 lg:pb-10 auto-rows-fr">
              {isLoadingProducts && currentPage === 1 ? (
                <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-200" /></div>
              ) : (
                <>
                  {filteredProducts.map(p => (
                    <Tooltip key={p.id}>
                      <TooltipTrigger asChild>
                        <button 
                          disabled={p.stockQuantity <= 0} 
                          onClick={() => addToBasket({ id: p.id, name: p.name, price: p.price, stock: p.stockQuantity, categoryName: p.categoryName || "Uncategorized" })} 
                          className={cn(
                            "p-3.5 bg-white border border-slate-100 rounded-2xl text-left hover:border-slate-400 transition-all active:scale-95 shadow-sm flex flex-col h-full group relative", 
                            p.stockQuantity <= 0 && "opacity-30 grayscale"
                          )}
                        >
                          <div className="flex items-center gap-1.5 mb-2.5 shrink-0">
                            <div className={cn("w-1.5 h-1.5 rounded-full", p.stockQuantity <= p.lowStockThreshold ? "bg-rose-500" : "bg-emerald-500")} />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{p.stockQuantity} Left</span>
                          </div>
                          <div className="flex-1 mb-3">
                            <p className={cn("font-bold text-slate-800 uppercase tracking-tight break-words leading-[1.2] line-clamp-3", p.name.length > 25 ? "text-[10px]" : "text-[11px]")}>
                              {p.name}
                            </p>
                          </div>
                          <div className="mt-auto pt-2 shrink-0">
                             <div className="bg-slate-50 group-hover:bg-slate-900 group-hover:text-white transition-colors rounded-xl py-1.5 px-2 text-center">
                                <p className="font-black text-[13px]">₱{p.price.toLocaleString()}</p>
                             </div>
                          </div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="bg-slate-900 text-white border-none rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase max-w-[180px] text-center shadow-xl">
                        {p.name}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                  
                  {/* INFINITE SCROLL TARGET */}
                  <div ref={observerTarget} className="col-span-full h-24 flex items-center justify-center border-t border-transparent">
                    {hasMore ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="animate-spin text-slate-300 h-5 w-5" />
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Loading Items...</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest py-10">End of Inventory</span>
                    )}
                  </div>
                </>
              )}
            </div>
          </TooltipProvider>
        </div>

        {/* MOBILE OVERLAY UI (BASKET) */}
        {basket.length > 0 && (
          <div className="lg:hidden absolute bottom-6 left-4 right-4 z-40 pointer-events-none">
            <div className="relative h-32 w-full mb-3">
              {recentItems.map((item, idx) => (
                <div key={item.productId} style={{ zIndex: 40 - idx, transform: `translateY(${idx * -14}px) scale(${1 - idx * 0.04})`, opacity: 1 - idx * 0.15 }} className={cn("absolute bottom-0 w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-lg transition-all duration-300 pointer-events-auto", idx === 0 ? "border-slate-300 ring-1 ring-black/5" : "border-slate-100")}>
                  <div className="flex flex-col min-w-0 flex-1 mr-2">
                    <span className="text-[10px] font-black uppercase text-slate-900 leading-tight line-clamp-1">{item.name}</span>
                    <span className="text-[9px] font-bold text-blue-600">₱{(item.unitPrice * item.quantity).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-1 mr-2 border border-slate-100">
                    <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:bg-white rounded-lg active:scale-90 transition-transform"><Minus className="h-3 w-3 text-slate-600" /></button>
                    <span className="text-[11px] font-black text-slate-900 w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:bg-white rounded-lg active:scale-90 transition-transform"><Plus className="h-3 w-3 text-slate-600" /></button>
                  </div>
                  <button onClick={() => removeFromBasket(item.productId)} className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button className="h-14 w-full rounded-2xl bg-slate-900 shadow-2xl flex items-center justify-between px-6 active:scale-95 transition-transform pointer-events-auto">
                  <div className="flex items-center gap-2 text-white font-bold text-xs"><ShoppingCart className="h-4 w-4" /> <span>VIEW {basket.length} ITEMS</span></div>
                  <div className="bg-white/10 px-3 py-1 rounded-lg font-black text-xs text-white">₱{total.toLocaleString()}</div>
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[92vh] p-0 rounded-t-[2.5rem] border-none overflow-hidden [&>button]:hidden">
                <TransactionView {...transactionProps} onClose={() => setIsSheetOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
        )}
      </section>

      {/* RIGHT SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex w-85 flex-col bg-white h-full border-l border-slate-50 shrink-0 overflow-hidden relative">
        <TransactionView {...transactionProps} />
      </aside>
    </div>
  );
}