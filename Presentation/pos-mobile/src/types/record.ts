export interface RecentTransaction {
  id: string;
  transactionDate: string;
  totalAmount: number;
  paymentType: string;
  itemCount: number;
}

export interface DailySummary {
  totalRevenue: number;
  totalTransactions: number;
  lowStockCount: number;
  date: string;
}

export interface TransactionItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
}

export interface TransactionDetails {
  id: string;
  transactionDate: string;
  totalAmount: number;
  cashReceived: number;
  changeAmount: number;
  paymentType: string;
  userName: string;
  items: TransactionItem[];
}
