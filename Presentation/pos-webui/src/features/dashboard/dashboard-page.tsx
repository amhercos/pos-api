import { useDashboard } from "./hooks/use-dashboard";
import { StatCard } from "./components/stat-card";
import { 
  AlertCircle, Package, Receipt, TrendingUp, RefreshCcw, 
  CheckCircle2, Plus, ChevronLeft, ChevronRight, ArrowRight
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
          
          {/* FIXED NAVIGATION: Changed from '/pos' to '/sales/new' */}
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
            {/* FIXED NAVIGATION: Changed from '/records' to your actual reports/history route */}
            <Link to="/reports" className="text-[11px] font-semibold text-blue-600 hover:underline underline-offset-4">See All History</Link>
          </div>
          
          <div className="divide-y divide-slate-50">
            {recent.length === 0 ? (
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
                    <p className="text-[10px] text-slate-400 font-medium">{new Date(tx.transactionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-200 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>

          <div className="p-2.5 bg-slate-50/20 border-t border-slate-50 flex justify-center items-center gap-6">
             <Button variant="ghost" size="sm" onClick={() => fetchPage(page - 1)} disabled={page === 1} className="h-8 text-[11px] font-semibold text-slate-400"><ChevronLeft className="h-3.5 w-3.5 mr-1"/> Prev</Button>
             <span className="text-[11px] font-bold text-slate-300">|</span>
             <Button variant="ghost" size="sm" onClick={() => fetchPage(page + 1)} disabled={recent.length < pageSize} className="h-8 text-[11px] font-semibold text-slate-400">Next <ChevronRight className="h-3.5 w-3.5 ml-1"/></Button>
          </div>
        </div>

        {/* --- Sidebar Status & Quick Actions --- */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Inventory Status Card */}
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
                  {(summary?.lowStockCount ?? 0) > 0 ? 'Action Required' : 'All Clear'}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                   {(summary?.lowStockCount ?? 0) > 0 ? `${summary?.lowStockCount} items need restocking` : 'Inventory is healthy'}
                </span>
              </div>
            </div>
            
            {/* FIXED NAVIGATION: Points to /inventory */}
            <Button 
              onClick={() => navigate('/inventory')}
              variant={ (summary?.lowStockCount ?? 0) > 0 ? "default" : "outline" }
              className={cn(
                "w-full h-9 rounded-xl text-[11px] font-black uppercase tracking-wider",
                (summary?.lowStockCount ?? 0) > 0 ? "bg-orange-600 hover:bg-orange-700 shadow-orange-100" : "border-emerald-200 text-emerald-700"
              )}
            >
              Manage Products
            </Button>
          </div>

          {/* Quick Insights Placeholder */}
          <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/30 flex flex-col gap-1">
             <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.1em]">Current Focus</span>
             <p className="text-xs text-slate-600 leading-relaxed font-medium">
               Your revenue is up <span className="text-blue-600 font-bold">12%</span> compared to last Tuesday.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}