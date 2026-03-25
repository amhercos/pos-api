import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type Product } from "../types";
import { Button } from "@/components/ui/button";
import { Trash2, MoreHorizontal, Pencil} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface InventoryTableProps {
  products: Product[];
  loading: boolean;
  onDelete: (id: string) => Promise<void>;
  onEdit: (product: Product) => void; 
}

export function InventoryTable({ products, loading, onDelete, onEdit }: InventoryTableProps) {
  const formatPHP = (val: number) => 
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val);

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-slate-100 hover:bg-transparent">
          <TableHead className="text-[11px] font-bold uppercase text-slate-900 tracking-wider h-10">Product</TableHead>
          <TableHead className="text-[11px] font-bold uppercase text-slate-900 tracking-wider h-10">Description</TableHead>
          <TableHead className="text-[11px] font-bold uppercase text-slate-900 tracking-wider h-10">Category</TableHead>
          <TableHead className="text-[11px] font-bold uppercase text-slate-900 tracking-wider h-10 text-center">Stock</TableHead>
          <TableHead className="text-[11px] font-bold uppercase text-slate-900 tracking-wider h-10 text-right">Price</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={6} className="h-32 text-center text-xs font-semibold text-slate-300 uppercase">Loading catalog...</TableCell>
          </TableRow>
        ) : products.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={6} className="h-32 text-center">
              <span className="text-xs font-semibold text-slate-300 uppercase">No products found</span>
            </TableCell>
          </TableRow>
        ) : (
          products.map((p) => (
            <TableRow 
              key={p.id} 
              className="group border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
            >
              {/* Tighter padding (py-3) and Semibold font */}
              <TableCell className="py-3 font-semibold text-[13px] text-slate-900">{p.name}</TableCell>
              
              <TableCell className="py-3 max-w-[280px]">
                <p className="text-[12px] text-slate-500 font-normal line-clamp-1">{p.description || "—"}</p>
              </TableCell>

              <TableCell className="py-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                  {p.categoryName || "General"}
                </span>
              </TableCell>
              
              <TableCell className="py-3 text-center">
                <span className={cn(
                  "text-[12px] font-bold tabular-nums px-2 py-0.5 rounded-md",
                  p.stockQuantity <= p.lowStockThreshold 
                    ? "text-rose-600 bg-rose-50" 
                    : "text-slate-700 bg-slate-100"
                )}>
                  {p.stockQuantity}
                </span>
              </TableCell>
              
              <TableCell className="py-3 text-right font-semibold text-[13px] tabular-nums">
                {formatPHP(p.price)}
              </TableCell>
              
              <TableCell className="py-3 text-right pr-2">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-7 w-7 p-0 hover:bg-white border border-transparent hover:border-slate-200 rounded-md transition-all">
                      <MoreHorizontal className="h-4 w-4 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white border border-slate-200 shadow-xl rounded-xl p-1 w-40">
                    <DropdownMenuItem 
                      onClick={() => onEdit(p)} 
                      className="rounded-lg py-2 px-3 text-[11px] font-semibold text-slate-600 focus:bg-slate-50 focus:text-slate-900 cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(p.id)} 
                      className="rounded-lg py-2 px-3 text-[11px] font-semibold text-rose-600 focus:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}