import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { type Product } from "../types";
import { Button } from "@/components/ui/button";
import { Trash2, MoreHorizontal, RefreshCcw, Pencil, Package } from "lucide-react";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface InventoryTableProps {
  products: Product[];
  loading: boolean;
  onDelete: (id: string) => Promise<void>;
  onEdit: (product: Product) => void; // Added Edit prop
}

export function InventoryTable({ products, loading, onDelete, onEdit }: InventoryTableProps) {
  const formatPHP = (val: number) => 
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val);

  return (
    <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden w-full">
      {/* Container with fixed layout to prevent shifting */}
      <div className="overflow-x-auto custom-scrollbar touch-pan-x">
        <Table className="min-w-[800px] md:min-w-full table-fixed">
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-b border-slate-100">
              <TableHead className="w-[30%] text-[11px] font-bold uppercase text-slate-400 pl-6 h-12">Product</TableHead>
              <TableHead className="w-[20%] text-[11px] font-bold uppercase text-slate-400 h-12">Category</TableHead>
              <TableHead className="w-[20%] text-[11px] font-bold uppercase text-slate-400 h-12">Stock Status</TableHead>
              <TableHead className="w-[20%] text-[11px] font-bold uppercase text-slate-400 text-right pr-6 h-12">Price</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-24 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCcw className="h-6 w-6 animate-spin text-slate-200" />
                    <span className="text-xs font-medium text-slate-400">Loading inventory...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-24 text-center">
                   <Package className="h-10 w-10 text-slate-100 mx-auto mb-3" />
                   <p className="text-slate-400 text-sm font-medium">No products found</p>
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => (
                <TableRow key={p.id} className="hover:bg-slate-50/20 transition-colors border-b border-slate-50 last:border-0 group">
                  <TableCell className="py-4 pl-6">
                    <span className="font-bold text-[13.5px] text-slate-900 truncate block">
                      {p.name}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 uppercase tracking-tight">
                      {p.categoryName}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        "w-2 h-2 rounded-full shadow-sm",
                        p.stockQuantity === 0 ? "bg-rose-500 shadow-rose-100" : 
                        p.stockQuantity <= p.lowStockThreshold ? "bg-amber-400 shadow-amber-100" : 
                        "bg-emerald-500 shadow-emerald-100"
                      )} />
                      <span className="text-[13px] font-bold text-slate-700">{p.stockQuantity}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-right pr-6 font-black text-slate-900 text-[14px]">
                    {formatPHP(p.price)}
                  </TableCell>
                  
                  <TableCell className="pr-4 text-right">
                    <DropdownMenu modal={false}> {/* modal={false} prevents the layout shift/scroll-lock */}
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
                        >
                          <MoreHorizontal className="h-4 w-4"/>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end" 
                        className="w-40 rounded-xl border-slate-100 shadow-2xl p-1.5 bg-white"
                      >
                        <DropdownMenuItem 
                          onClick={() => onEdit(p)}
                          className="rounded-lg gap-2 font-semibold text-slate-600 focus:text-slate-900 cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5 text-slate-400" /> Edit Product
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator className="bg-slate-50" />
                        
                        <DropdownMenuItem 
                          onClick={() => onDelete(p.id)}
                          className="rounded-lg gap-2 font-semibold text-rose-600 focus:text-rose-700 focus:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}