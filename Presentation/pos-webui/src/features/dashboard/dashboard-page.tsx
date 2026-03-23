import { useDashboard } from "./hooks/use-dashboard";
import { StatCard } from "./components/stat-card";
import { 
  AlertCircle, Package, Receipt, TrendingUp, RefreshCcw, 
  CheckCircle2,  Plus, ChevronLeft, ChevronRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export function DashboardPage() {
  const navigate = useNavigate();
  const { summary, recent, isLoadingSummary, page, pageSize, refresh, fetchPage } = useDashboard();

  const formatPHP = (amount: number) => 
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

  return (
    <div className="flex flex-col gap-5 p-4 lg:p-6 max-w-6xl mx-auto w-full bg-white min-h-screen text-slate-900">
      
      {/* --- Apple Professional Header --- */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-[12px] text-slate-400 font-medium">
            {summary?.date ? new Date(summary.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' }) : "Loading..."}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={refresh}
            className="h-9 px-3 rounded-lg text-slate-500 hover:bg-slate-50"
          >
            <RefreshCcw className={cn("h-4 w-4", isLoadingSummary && "animate-spin")} />
          </Button>
          
          {/* Primary Action: Placed at the top for immediate access */}
          <Button 
            onClick={() => navigate('/pos')}
            className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-sm shadow-blue-200 font-semibold text-[13px] transition-all active:scale-95 flex items-center gap-2"
          >
            <Plus className="h-4 w-4 stroke-3" />
            New Sale
          </Button>
        </div>
      </div>

      {/* --- Compact Stats --- */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title="Revenue"
          value={isLoadingSummary ? "..." : formatPHP(summary?.totalRevenue ?? 0)}
          icon={<TrendingUp className="h-4 w-4 text-blue-500" />}
          className="rounded-xl border-none bg-slate-50/50 p-4 shadow-none"
        />
        <StatCard
          title="Orders"
          value={isLoadingSummary ? "..." : (summary?.totalTransactions ?? 0)}
          icon={<Receipt className="h-4 w-4 text-slate-400" />}
          className="rounded-xl border-none bg-slate-50/50 p-4 shadow-none"
        />
        <StatCard
          title="Low Stock"
          value={isLoadingSummary ? "..." : (summary?.lowStockCount ?? 0)}
          icon={<Package className="h-4 w-4 text-orange-500" />}
          className="rounded-xl border-none bg-slate-50/50 p-4 shadow-none"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        {/* --- Recent Activity List --- */}
        <div className="lg:col-span-8 rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between bg-white border-b border-slate-50">
            <h3 className="text-[13px] font-semibold text-slate-700">Recent Transactions</h3>
            <Link to="/records" className="text-[11px] font-semibold text-blue-600">See All</Link>
          </div>
          
          <div className="divide-y divide-slate-50">
            {recent.map((tx) => (
              <div 
                key={tx.id} 
                onClick={() => navigate(`/records`)}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-1 h-6 rounded-full",
                    tx.paymentType === 'Cash' ? "bg-emerald-400" : "bg-blue-400"
                  )} />
                  <div>
                    <p className="text-[14px] font-semibold text-slate-900 leading-none">
                      {tx.itemCount} {tx.itemCount === 1 ? 'Product' : 'Products'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tight font-mono">
                      REF: {tx.id.slice(-6).toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-bold text-slate-900">{formatPHP(tx.totalAmount)}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{new Date(tx.transactionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Minimal Pagination */}
          <div className="p-2.5 bg-slate-50/20 border-t border-slate-50 flex justify-center items-center gap-6">
             <Button variant="ghost" size="sm" onClick={() => fetchPage(page - 1)} disabled={page === 1} className="h-8 text-[11px] font-semibold text-slate-400"><ChevronLeft className="h-3.5 w-3.5 mr-1"/> Prev</Button>
             <span className="text-[11px] font-bold text-slate-300">|</span>
             <Button variant="ghost" size="sm" onClick={() => fetchPage(page + 1)} disabled={recent.length < pageSize} className="h-8 text-[11px] font-semibold text-slate-400">Next <ChevronRight className="h-3.5 w-3.5 ml-1"/></Button>
          </div>
        </div>

        {/* --- Sidebar Sidebar Status --- */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className={cn(
            "p-4 rounded-xl border flex items-center justify-between",
            (summary?.lowStockCount ?? 0) > 0 ? "bg-orange-50/40 border-orange-100/50" : "bg-emerald-50/40 border-emerald-100/50"
          )}>
            <div className="flex items-center gap-3">
              {(summary?.lowStockCount ?? 0) > 0 
                ? <AlertCircle className="h-4 w-4 text-orange-500" />
                : <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              }
              <span className="text-[12px] font-semibold text-slate-700 tracking-tight leading-none">
                {(summary?.lowStockCount ?? 0) > 0 ? `${summary?.lowStockCount} Low Stock` : 'Stock Levels Good'}
              </span>
            </div>
            <Link to="/inventory">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-bold uppercase text-slate-400 hover:text-slate-900 tracking-wider">
                Resolve
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}