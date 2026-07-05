export type TransactionType = "ONE_TIME" | "RECURRING";

export enum GatewayType {
  STRIPE = "STRIPE",
  RAZORPAY = "RAZORPAY",
  UPI = "UPI",
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  sender: string;
  receiver: string;
  transactionType: TransactionType;
}

export interface IPaymentGateway {
  processPayment(request: PaymentRequest): Promise<boolean>;
}
