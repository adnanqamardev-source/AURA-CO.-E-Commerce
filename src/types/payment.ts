export type TransactionType = "ONE_TIME" | "RECURRING";

export interface PaymentRequest {
  amount: number;
  currency: string;
  sender: string;
  receiver: string;
  transactionType: TransactionType;
}

export enum GatewayType {
  STRIPE = "STRIPE",
  RAZORPAY = "RAZORPAY",
}
