import { useState, useMemo, useEffect } from "react";
import { useCredits } from "./hooks/use-credits";
import { PayCreditModal } from "./components/pay-credit-modal";
import { EditCreditModal } from "./components/edit-credit-modal";
import { CreditSummarySheet } from "./components/credit-summary-sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, ReceiptText, Loader2, UserCog, 
  RefreshCcw, ArrowUpDown, CheckCircle2, History, Wallet
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { CustomerCredit, CustomerCreditSummary } from "./types/credit";
import { toast } from "sonner";

export default function CreditsPage() {
  const { credits, loading, fetchCredits, recordPayment, updateCredit, getSummary } = useCredits();
  
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showSettled, setShowSettled] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>('desc');
  
  const [selectedCredit, setSelectedCredit] = useState<CustomerCredit | null>(null);
  const [editingCredit, setEditingCredit] = useState<CustomerCredit | null>(null);
  const [summaryData, setSummaryData] = useState<CustomerCreditSummary | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchCredits(debouncedSearch, showSettled);
  }, [debouncedSearch, showSettled, fetchCredits]);

  const handleOpenSummary = async (id: string) => {
    setIsSummaryOpen(true);
    setIsSummaryLoading(true);
    try {
      const summary = await getSummary(id);
      if (summary) setSummaryData(summary);
    } catch {
      toast.error("Could not load summary");
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const handleToggleSettled = () => {
    setShowSettled(!showSettled);
  };

  const processedCredits = useMemo(() => {
    const result = [...credits];
    
    if (sortOrder) {
      result.sort((a, b) => sortOrder === 'asc' ? a.creditAmount - b.creditAmount : b.creditAmount - a.creditAmount);
    }
    return result;
  }, [credits, sortOrder]);

  const totalOutstanding = useMemo(() => 
    credits.reduce((acc, curr) => acc + curr.creditAmount, 0), [credits]
  );

  const formatPHP = (val: number) => 
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val);

  return (
    <div className="flex flex-col gap-5 p-4 lg:p-6 max-w-6xl mx-auto w-full bg-white min-h-screen text-slate-900">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Customer Credit</h1>
          <p className="text-[12px] text-slate-400 font-medium">Manage debt and payment history</p>
        </div>
        <div className="flex items-center gap-2">
           <Button 
            variant="ghost" size="sm" 
            onClick={() => fetchCredits(search, showSettled)}
            className="h-9 px-3 rounded-lg text-slate-500 hover:bg-slate-50 font-semibold text-xs"
          >
            <RefreshCcw className={cn("mr-2 h-3.5 w-3.5", loading && "animate-spin")} />
            Sync
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-slate-50/50 p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Outstanding</p>
            <p className="text-xl font-bold text-rose-600">{formatPHP(totalOutstanding)}</p>
          </div>
          <Wallet className="h-5 w-5 text-rose-400" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input 
            placeholder="Search name..." 
            className="pl-9 h-10 border-slate-100 bg-slate-50/50 rounded-xl text-[13px] focus:bg-white transition-all shadow-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleToggleSettled}
          className={cn(
            "h-10 px-4 rounded-xl border-slate-100 text-[11px] font-bold uppercase tracking-wider transition-all",
            showSettled ? "bg-slate-900 text-white border-slate-900" : "text-slate-400 hover:bg-slate-50"
          )}
        >
          <History className="mr-2 h-3.5 w-3.5" />
          {showSettled ? "Settled Included" : "Show Settled"}
        </Button>
      </div>

      <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-b border-slate-100">
              <TableHead className="text-[11px] font-bold uppercase text-slate-400 tracking-wider pl-6 h-11">Customer</TableHead>
              <TableHead className="text-[11px] font-bold uppercase text-slate-400 tracking-wider h-11">Contact</TableHead>
              <TableHead 
                className="text-[11px] font-bold uppercase text-slate-400 tracking-wider text-right h-11 cursor-pointer hover:text-slate-900"
                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              >
                <div className="flex items-center justify-end gap-1">
                  Balance <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase text-slate-400 tracking-wider text-center pr-6 h-11">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="py-24 text-center"><Loader2 className="animate-spin h-5 w-5 mx-auto text-slate-200" /></TableCell></TableRow>
            ) : processedCredits.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="py-24 text-center text-slate-400 text-xs font-medium">No records found.</TableCell></TableRow>
            ) : (
              processedCredits.map((c) => (
                <TableRow key={c.id} className="group hover:bg-slate-50/80 transition-colors border-b border-slate-50 last:border-0">
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-[14px]">{c.customerName}</span>
                      {c.creditAmount === 0 && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-400 text-[12px] font-medium">{c.contactInfo || "—"}</TableCell>
                  <TableCell className={cn("text-right font-bold text-[14px] tabular-nums", c.creditAmount > 0 ? "text-rose-600" : "text-emerald-600")}>
                    {c.creditAmount === 0 ? "Settled" : formatPHP(c.creditAmount)}
                  </TableCell>
                  <TableCell className="pr-6">
                    <div className="flex justify-center gap-1.5">
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => setEditingCredit(c)}><UserCog className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" className="h-8 gap-2 text-[11px] font-bold text-slate-500 hover:text-slate-900" onClick={() => handleOpenSummary(c.id)}><ReceiptText className="h-3.5 w-3.5" /> Summary</Button>
                      {c.creditAmount > 0 && (
                        <Button size="sm" className="h-8 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-sm active:scale-95" onClick={() => setSelectedCredit(c)}>Pay</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreditSummarySheet 
        summary={summaryData} 
        isOpen={isSummaryOpen} 
        isLoading={isSummaryLoading}
        onClose={() => { setIsSummaryOpen(false); setSummaryData(null); }}
      />

      <EditCreditModal 
        credit={editingCredit} 
        isOpen={!!editingCredit}
        onClose={() => setEditingCredit(null)}
        onConfirm={(name, contact) => updateCredit(editingCredit!.id, name, contact)}
      />

      <PayCreditModal 
        credit={selectedCredit} 
        isOpen={!!selectedCredit}
        onClose={() => setSelectedCredit(null)}
        onConfirm={(amountPaid) => recordPayment(selectedCredit!.id, amountPaid)}
      />
    </div>
  );
}