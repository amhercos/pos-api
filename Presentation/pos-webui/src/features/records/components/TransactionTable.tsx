import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, ReceiptText } from "lucide-react";
import type { RecentTransaction } from "../types";
import { cn } from "@/lib/utils";

interface TransactionTableProps {
  data: RecentTransaction[];
  loading: boolean;
  onViewDetails: (id: string) => void;
}

export function TransactionTable({ data, loading, onViewDetails }: TransactionTableProps) {
  const formatPHP = (val: number) => 
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/40">
          <TableRow className="hover:bg-transparent border-b border-slate-100">
            <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-6">Date & Time</TableHead>
            <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Reference ID</TableHead>
            <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Method</TableHead>
            <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Amount</TableHead>
            <TableHead className="w-20 pr-6"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-24">
                <div className="flex flex-col items-center gap-2 opacity-40">
                  <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-tighter">Updating Records...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-24 text-slate-400">
                <ReceiptText className="h-8 w-8 mx-auto mb-2 opacity-10" />
                <p className="text-xs font-bold uppercase tracking-tight">No transactions found</p>
              </TableCell>
            </TableRow>
          ) : (
            data.map((tx) => (
              <TableRow key={tx.id} className="group hover:bg-slate-50/50 transition-all border-b border-slate-50 last:border-0">
                <TableCell className="py-5 pl-6">
                  <p className="text-xs font-bold text-slate-700 tracking-tight">
                    {new Date(tx.transactionDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
                    {new Date(tx.transactionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">
                    {tx.id.slice(-8)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={tx.paymentType === 'Credit' ? 'outline' : 'default'} 
                    className={cn(
                        "text-[9px] font-black uppercase px-2.5 py-0.5 shadow-none border-transparent",
                        tx.paymentType === 'Cash' 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                            : "bg-orange-50 text-orange-600 border-orange-100"
                    )}
                  >
                    {tx.paymentType}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm font-black text-slate-900 tracking-tight">
                    {formatPHP(tx.totalAmount)}
                  </span>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full group-hover:bg-white group-hover:shadow-md border border-transparent group-hover:border-slate-100 transition-all" 
                    onClick={() => onViewDetails(tx.id)}
                  >
                    <Eye className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}