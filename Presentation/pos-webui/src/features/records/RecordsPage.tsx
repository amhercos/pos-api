import { useTransactionHistory } from "./hooks/use-transaction-history";
import { ReceiptView } from "./components/ReceiptView";
import { useState, useMemo } from "react";
import type { TransactionDetails } from "./types";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Search, RefreshCcw, ChevronLeft, ChevronRight, 
  Calendar as CalendarIcon, SlidersHorizontal, ReceiptText 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, isSameDay } from "date-fns";

export function RecordsPage() {
  const { 
    transactions, loading, page, setPage, pageSize, refresh, getTransactionById 
  } = useTransactionHistory();

  const [selectedTx, setSelectedTx] = useState<TransactionDetails | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  const handleOpenReceipt = async (id: string) => {
    const data = await getTransactionById(id);
    if (data) {
      setSelectedTx(data);
      setIsReceiptOpen(true);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const txDate = new Date(tx.transactionDate);
      const matchesDate = date ? isSameDay(txDate, date) : true;
      const matchesSearch = tx.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDate && matchesSearch;
    });
  }, [transactions, date, searchQuery]);

  const formatPHP = (val: number) => 
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val);

  return (
    <div className="flex flex-col gap-5 p-4 lg:p-6 max-w-6xl mx-auto w-full bg-white min-h-screen text-slate-900">
      
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Records</h1>
          <p className="text-[12px] text-slate-400 font-medium mt-0.5">Audit and review history</p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={refresh}
          className="h-9 px-3 rounded-lg text-slate-500 hover:bg-slate-50 font-semibold text-xs"
        >
          <RefreshCcw className={cn("mr-2 h-3.5 w-3.5", loading && "animate-spin")} />
          Sync
        </Button>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Reference ID..." 
            className="pl-9 h-10 border-slate-100 bg-slate-50/50 rounded-xl text-[13px]" 
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full md:w-48 h-10 justify-start text-left font-semibold text-[12px] rounded-xl border-slate-100 bg-white"
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5 text-slate-400" />
                {date ? format(date, "MMM dd, yyyy") : <span>Date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white border-slate-100 shadow-xl rounded-2xl" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="p-3" 
              />
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 border-slate-100 rounded-xl text-slate-400">
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-b border-slate-100">
              <TableHead className="text-[11px] font-bold uppercase text-slate-400 pl-6 h-11">Timestamp</TableHead>
              <TableHead className="text-[11px] font-bold uppercase text-slate-400 h-11">Reference</TableHead>
              <TableHead className="text-[11px] font-bold uppercase text-slate-400 h-11">Method</TableHead>
              <TableHead className="text-[11px] font-bold uppercase text-slate-400 text-right pr-6 h-11">Net Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-24">
                  <RefreshCcw className="h-5 w-5 animate-spin mx-auto text-slate-200" />
                </TableCell>
              </TableRow>
            ) : filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-24">
                  <ReceiptText className="h-8 w-8 text-slate-100 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-400 uppercase">No entries for this date</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((tx) => (
                <TableRow 
                  key={tx.id} 
                  onClick={() => handleOpenReceipt(tx.id)}
                  className="group cursor-pointer hover:bg-slate-50/80 border-b border-slate-50 last:border-0"
                >
                  <TableCell className="py-4 pl-6">
                    <p className="text-[13px] font-semibold text-slate-900 leading-none">
                      {format(new Date(tx.transactionDate), "MMM dd")}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">
                      {format(new Date(tx.transactionDate), "hh:mm aa")}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-[11px] font-medium text-slate-400">
                      {tx.id.slice(-8).toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        tx.paymentType === 'Cash' ? "bg-emerald-400" : "bg-blue-400"
                      )} />
                      <span className="text-[12px] font-medium text-slate-600">{tx.paymentType}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <span className="text-[14px] font-bold text-slate-900 tabular-nums">
                      {formatPHP(tx.totalAmount)}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/20 flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">
              {filteredTransactions.length} results
            </span>
            <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setPage(page - 1)} 
                  disabled={page === 1} 
                  className="h-8 text-[11px] font-bold text-slate-400"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1"/> Prev
                </Button>
                <div className="h-3 w-px bg-slate-200" />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setPage(page + 1)} 
                  disabled={transactions.length < pageSize} 
                  className="h-8 text-[11px] font-bold text-slate-400"
                >
                  Next <ChevronRight className="h-3.5 w-3.5 ml-1"/>
                </Button>
            </div>
        </div>
      </div>

      <ReceiptView 
        data={selectedTx} 
        isOpen={isReceiptOpen} 
        onClose={() => setIsReceiptOpen(false)} 
      />
    </div>
  );
}