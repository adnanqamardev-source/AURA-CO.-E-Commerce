import { PaymentRequest, GatewayType } from "../types/payment";
import { GatewayFactory } from "./GatewayFactory";

export class PaymentService {
  private static instance: PaymentService | null = null;
  private ledger: Array<{
    timestamp: string;
    gateway: string;
    request: PaymentRequest;
    success: boolean;
    auditId: string;
    section194OLog: string;
  }> = [];

  private constructor() {
    console.log("[PaymentService] Initializing payment service singleton instance...");
  }

  /**
   * Singleton accessor
   */
  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  /**
   * Main orchestrator for checking out and processing payments
   */
  public async checkout(gatewayType: GatewayType, request: PaymentRequest): Promise<{
    success: boolean;
    message: string;
    auditId: string;
    ledgerEntry: any;
  }> {
    const auditId = `TXN_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    console.log(`[PaymentService] Orchestrating checkout via ${gatewayType}. Transaction ID: ${auditId}`);

    // Fetch the resilient, proxy-wrapped gateway from the factory
    const gateway = GatewayFactory.createGateway(gatewayType);

    let success = false;
    let message = "";

    try {
      // Process the payment through the proxy-wrapped gateway
      success = await gateway.processPayment(request);
      message = "Payment completed and settled successfully.";
    } catch (error: any) {
      success = false;
      message = error instanceof Error ? error.message : String(error);
      console.error(`[PaymentService] Checkout transaction ${auditId} failed: ${message}`);
    }

    // Ledger Entry & Section 194-O Compliance Logging
    // Section 194-O mandates 1% TDS deduction on payment settlements to Indian e-commerce sellers
    const tdsDeduction = request.currency.toUpperCase() === "INR" ? request.amount * 0.01 : 0;
    const settlementAmount = request.amount - tdsDeduction;

    const section194OLog = request.currency.toUpperCase() === "INR"
      ? `Section 194-O Active. Curated Marketplace TDS (1%) Deducted: ₹${tdsDeduction.toFixed(2)} INR. Amount Settled to Merchant VPA: ₹${settlementAmount.toFixed(2)} INR.`
      : "International Transaction. Direct Settlement without Section 194-O domestic TDS constraints.";

    const ledgerEntry = {
      timestamp: new Date().toISOString(),
      gateway: gateway.getName(),
      request,
      success,
      auditId,
      section194OLog,
      tdsDeduction,
      settlementAmount,
    };

    this.ledger.push(ledgerEntry);
    console.log(`[PaymentService] Ledger Audit Trail Registered:`, ledgerEntry);

    return {
      success,
      message,
      auditId,
      ledgerEntry,
    };
  }

  /**
   * Access historical payment ledger logs (helpful for audit reporting panel)
   */
  public getLedger() {
    return this.ledger;
  }
}
