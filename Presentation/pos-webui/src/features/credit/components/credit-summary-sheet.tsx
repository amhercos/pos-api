import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription 
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, ArrowDownLeft, Calendar, User, Loader2 } from "lucide-react";
import type { CustomerCreditSummary } from "../types/credit";

interface CreditSummarySheetProps {
  summary: CustomerCreditSummary | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
}

export function CreditSummarySheet({ summary, isOpen, onClose, isLoading }: CreditSummarySheetProps) {
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] p-0 border-l border-slate-100 shadow-2xl">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
          </div>
        ) : summary ? (
          <div className="h-full flex flex-col bg-white">
            <SheetHeader className="p-8 pb-6 bg-slate-50/50">
              <div className="flex items-center gap-3 mb-2 text-blue-600">
                <User className="h-5 w-5" />
                <SheetTitle className="text-xl font-bold tracking-tight">{summary.customerName}</SheetTitle>
              </div>
              <SheetDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Contact: {summary.contactInfo}
              </SheetDescription>
              
              <div className="mt-6 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Outstanding Balance</p>
                <h2 className="text-3xl font-black text-rose-600">₱{summary.totalDebt.toLocaleString()}</h2>
              </div>
            </SheetHeader>

            {/* Standard div scrolling to replace ScrollArea */}
            <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
              <div className="space-y-8">
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <ShoppingBag className="h-4 w-4 text-slate-900" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Purchase History</h3>
                  </div>
                  <div className="space-y-3">
                    {summary.creditPurchases.map((p) => (
                      <div key={p.id} className="p-4 rounded-2xl border border-slate-50 bg-slate-50/50">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-bold text-slate-800">₱{p.totalAmount.toLocaleString()}</span>
                          <Badge variant="outline" className="text-[10px] bg-white text-slate-500 border-slate-200">{p.itemCount} items</Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Calendar className="h-3 w-3" /> {formatDate(p.transactionDate)}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <Separator className="bg-slate-100" />

                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Payment Trail</h3>
                  </div>
                  <div className="space-y-3 pb-8">
                    {summary.paymentHistory.map((pmt) => (
                      <div key={pmt.id} className="flex items-center justify-between p-4 rounded-2xl border border-emerald-50 bg-emerald-50/30">
                        <div>
                          <p className="text-[10px] text-slate-400 leading-none mb-1">{formatDate(pmt.paymentDate)}</p>
                          <p className="text-sm font-bold text-slate-800 tracking-tight">Payment Received</p>
                        </div>
                        <span className="text-sm font-bold text-emerald-600">₱{pmt.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}