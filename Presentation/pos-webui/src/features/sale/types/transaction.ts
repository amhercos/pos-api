export const PaymentType = {
  Cash: 1,
  Credit: 2,
} as const;

export type PaymentType = typeof PaymentType[keyof typeof PaymentType];

export interface BasketItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;      
  stock: number;
  categoryName: string;
}

export interface CreateTransactionCommand {
  localId?: string;
  items: { 
    productId: string; 
    quantity: number; 
    unitPrice: number 
  }[];
  paymentType: PaymentType;
  totalAmount: number;
  cashReceived: number;
  changeAmount: number;
  customerCreditId?: string;
  newCustomerName?: string;
  newCustomerContact?: string;
  isOfflineSync?: boolean;
  offlineCreatedAt?: string;
}

export interface TransactionResponse {
  transactionId: string;
  message: string;
}

export interface ApiError {
  code?: string;
  message?: string;
  response?: {
    status?: number;
    data?: {
      Message?: string;
    };
  };
}