import type { Promotion } from "./promotion";

export type { Promotion };

export enum PaymentType {
  Cash = 1,
  Credit = 2,
}

export interface BasketItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  stock: number;
  promotions?: Promotion[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  categoryName: string;
  promotions?: Promotion[];
}

export interface CreateTransactionCommand {
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
  paymentType: PaymentType;
  totalAmount: number;
  cashReceived: number;
  changeAmount: number;
  customerCreditId?: string;
  newCustomerName?: string;
  newCustomerContact?: string;
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
      message?: string;
      Message?: string;
    };
  };
}

export interface CheckoutParams {
  paymentType: PaymentType;
  cashReceived?: number;
  customerCreditId?: string;
  newCustomerName?: string;
  newCustomerContact?: string;
}
