export interface DailySummary {
  totalRevenue: number;
  totalTransactions: number;
  lowStockCount: number;
  date: string;
}

export interface RecentTransaction {
  id: string;
  transactionDate: string;
  totalAmount: number;
  paymentType: "Cash" | "Credit";
  itemCount: number;
}

export interface NearExpiryProduct {
  id: string;
  name: string;
  stock: number;
  expiryDate: string | null;
  daysUntilExpiry: number;
}
