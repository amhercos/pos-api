import { useDashboard } from "./hooks/use-dashboard";
import { StatCard } from "./components/stat-card";
import { 
  AlertCircle, Package, Receipt, TrendingUp, RefreshCcw, 
  CheckCircle2, Plus, ChevronLeft, ChevronRight, ArrowRight,
  CalendarClock, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export function DashboardPage() {
  const navigate = useNavigate();
  const { 
    summary, 
    recent, 
    nearExpiry, 
    isLoadingSummary, 
    isLoadingRecent, 
    isLoadingExpiry, 
    page, 
    pageSize, 
    refresh, 
    fetchPage 
  } = useDashboard();

  const formatPHP = (amount: number) => 
    new Intl.NumberFormat('en-PH', { 
      style: 'currency', 
      currency: 'PHP',
      minimumFractionDigits: 2 
    }).format(amount);

  return (
    <div className="flex flex-col gap-5 p-4 lg:p-6 max-w-6xl mx-auto w-full bg-white min-h-screen text-slate-900">
      
      {/* --- Header --- */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-[12px] text-slate-400 font-medium">
            {summary?.date 
              ? new Date(summary.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) 
              : "Fetching today's data..."}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={refresh} 
            className="h-9 px-3 rounded-lg text-slate-500 hover:bg-slate-50"
            disabled={isLoadingSummary || isLoadingRecent || isLoadingExpiry}
          >
            <RefreshCcw className={cn("h-4 w-4", (isLoadingSummary || isLoadingRecent) && "animate-spin")} />
          </Button>
          <Button 
            onClick={() => navigate('/sales/new')}
            className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-sm shadow-blue-200 font-semibold text-[13px] transition-all active:scale-95 flex items-center gap-2"
          >
            <Plus className="h-4 w-4 stroke-3" />
            New Sale
          </Button>
        </div>
      </div>

      {/* --- Compact Stats --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <div className="lg:col-span-8 rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 flex items-center justify-between bg-white border-b border-slate-50">
            <h3 className="text-[13px] font-semibold text-slate-700">Recent Transactions</h3>
            <Link to="/reports" className="text-[11px] font-semibold text-blue-600 hover:underline underline-offset-4">See All History</Link>
          </div>
          
          <div className="divide-y divide-slate-50 flex-1">
            {isLoadingRecent ? (
               <div className="py-20 text-center text-slate-300">
                  <Clock className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Loading Sales...</p>
               </div>
            ) : recent.length === 0 ? (
                <div className="py-20 text-center opacity-20">
                    <Receipt className="h-10 w-10 mx-auto mb-2" />
                    <p className="text-xs font-black uppercase">No Recent Sales</p>
                </div>
            ) : recent.map((tx) => (
              <div 
                key={tx.id} 
                onClick={() => navigate(`/reports`)}
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
                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className="text-[14px] font-bold text-slate-900">{formatPHP(tx.totalAmount)}</p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {new Date(tx.transactionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-200 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>

          <div className="p-2.5 bg-slate-50/20 border-t border-slate-50 flex justify-center items-center gap-6">
             <Button variant="ghost" size="sm" onClick={() => fetchPage(page - 1)} disabled={page === 1 || isLoadingRecent} className="h-8 text-[11px] font-semibold text-slate-400">
                <ChevronLeft className="h-3.5 w-3.5 mr-1"/> Prev
             </Button>
             <span className="text-[11px] font-bold text-slate-300">|</span>
             <Button variant="ghost" size="sm" onClick={() => fetchPage(page + 1)} disabled={recent.length < pageSize || isLoadingRecent} className="h-8 text-[11px] font-semibold text-slate-400">
                Next <ChevronRight className="h-3.5 w-3.5 ml-1"/>
             </Button>
          </div>
        </div>

        {/* --- Sidebar Status & Quick Actions --- */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* 1. Inventory Status Card */}
          <div className={cn(
            "p-5 rounded-2xl border flex flex-col gap-4 shadow-sm",
            (summary?.lowStockCount ?? 0) > 0 ? "bg-orange-50/30 border-orange-100" : "bg-emerald-50/30 border-emerald-100"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                (summary?.lowStockCount ?? 0) > 0 ? "bg-orange-100 text-orange-600" : "bg-emerald-100 text-emerald-600"
              )}>
                {(summary?.lowStockCount ?? 0) > 0 ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-slate-900 tracking-tight">
                  {(summary?.lowStockCount ?? 0) > 0 ? 'Stock Alert' : 'Stock Healthy'}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                   {(summary?.lowStockCount ?? 0) > 0 ? `${summary?.lowStockCount} items low in stock` : 'All items well stocked'}
                </span>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/inventory')}
              variant={ (summary?.lowStockCount ?? 0) > 0 ? "default" : "outline" }
              className={cn(
                "w-full h-9 rounded-xl text-[11px] font-black uppercase tracking-wider",
                (summary?.lowStockCount ?? 0) > 0 ? "bg-orange-600 hover:bg-orange-700 shadow-orange-100" : "border-emerald-200 text-emerald-700"
              )}
            >
              Check Inventory
            </Button>
          </div>

          {/* 2. Near Expiry Alert Card */}
          <div className={cn(
            "p-5 rounded-2xl border flex flex-col gap-4 shadow-sm transition-all",
            (nearExpiry?.length ?? 0) > 0 ? "bg-rose-50/40 border-rose-100" : "bg-slate-50/30 border-slate-100"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                (nearExpiry?.length ?? 0) > 0 ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-400"
              )}>
                <CalendarClock className={cn("h-5 w-5", isLoadingExpiry && "animate-pulse")} />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-slate-900 tracking-tight">
                  {(nearExpiry?.length ?? 0) > 0 ? 'Expiry Warning' : 'Expiry Status'}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                   {isLoadingExpiry ? 'Checking shelf life...' : 
                    (nearExpiry?.length ?? 0) > 0 ? `${nearExpiry?.length} items near expiry` : 'All items are fresh'}
                </span>
              </div>
            </div>

            {/* List Preview for Expiry */}
            {!isLoadingExpiry && (nearExpiry?.length ?? 0) > 0 && (
              <div className="flex flex-col gap-2">
                {nearExpiry.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/60 border border-rose-100/50 shadow-sm">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-bold text-slate-700 truncate">{item.name}</span>
                      <span className="text-[9px] text-slate-400 uppercase font-black">Stock: {item.stock}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={cn(
                        "text-[10px] font-black px-2 py-0.5 rounded-full",
                        item.daysUntilExpiry <= 7 ? "bg-rose-100 text-rose-700" : "bg-orange-100 text-orange-700"
                      )}>
                        {item.daysUntilExpiry}d left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <Button 
              onClick={() => navigate('/inventory')}
              variant="outline"
              className={cn(
                "w-full h-9 rounded-xl text-[11px] font-black uppercase tracking-wider",
                (nearExpiry?.length ?? 0) > 0 ? "border-rose-200 text-rose-700 hover:bg-rose-100/50 bg-white" : "border-slate-200 text-slate-500"
              )}
            >
              { (nearExpiry?.length ?? 0) > 3 ? `View All ${nearExpiry.length} Items` : 'Manage Inventory' }
            </Button>
          </div>

          {/* Quick Insights */}
          <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/30 flex flex-col gap-1">
             <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.1em]">Insights</span>
             <p className="text-xs text-slate-600 leading-relaxed font-medium">
               Keep an eye on the <span className="text-rose-600 font-bold">Expiry Warning</span> list to minimize wastage.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}