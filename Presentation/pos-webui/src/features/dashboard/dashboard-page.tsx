import { useDashboard } from "./hooks/use-dashboard";
import { StatCard } from "./components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Package, Receipt, TrendingUp } from "lucide-react";

export function DashboardPage() {
  const { summary, recent, isLoading } = useDashboard();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      {/* 📊 Top Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Top Selling Product"
          value="Tuition" // You can replace this with real data if you add a 'TopProduct' endpoint
          description="Sales: ₱38,000.00"
          icon={<TrendingUp className="h-5 w-5 text-blue-500" />}
        />
        <StatCard
          title="Today's Transactions"
          value={summary?.totalTransactions ?? 0}
          icon={<Receipt className="h-5 w-5 text-green-500" />}
        />
        <StatCard
          title="Today's Total Sales"
          value={`₱${summary?.totalRevenue?.toLocaleString() ?? "0.00"}`}
          icon={<span className="text-purple-500 font-bold text-xl">₱</span>}
        />
      </div>

      {/* ⚠️ Alerts Section (Out of Stock / Low Stock) */}
      <Card className="border-orange-200 bg-orange-50/30">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          <CardTitle className="text-lg font-semibold text-orange-700">Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-bold text-red-600 flex items-center gap-2">
              <Package className="h-4 w-4" /> Out of Stock ({summary?.lowStockCount})
            </p>
            <ul className="text-sm text-muted-foreground ml-6 list-disc">
              <li>Lucky Me Chicken</li>
              <li>Tuition</li>
            </ul>
          </div>
          
          <div className="space-y-1 border-t pt-3">
            <p className="text-sm font-bold text-orange-600 flex items-center gap-2">
              <Package className="h-4 w-4" /> Low Stock
            </p>
            <ul className="text-sm text-muted-foreground ml-6 list-disc">
              <li>Sprite 1.5L - 5 left</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 🕒 Recent Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recent.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <p className="text-sm font-medium">{tx.paymentType} Transaction</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.transactionDate).toLocaleString()}
                  </p>
                </div>
                <p className="font-bold text-green-600">₱{tx.totalAmount?.toLocaleString()}</p>
              </div>
            ))}
            {recent.length === 0 && !isLoading && (
              <p className="text-sm text-muted-foreground text-center">No transactions found today.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}