import { PaymentRequest } from "../types/payment";

export abstract class PaymentGateway {
  // Template method enforcing execution flow
  public async processPayment(request: PaymentRequest): Promise<boolean> {
    console.log(`[${this.getName()}] Starting payment flow for ${request.amount} ${request.currency}`);
    
    // Step 1: Validate
    const isValid = await this.validate(request);
    if (!isValid) {
      console.error(`[${this.getName()}] Validation failed.`);
      throw new Error(`[${this.getName()}] Validation failed.`);
    }
    
    // Step 2: Initiate
    const isInitiated = await this.initiate(request);
    if (!isInitiated) {
      console.error(`[${this.getName()}] Initiation failed.`);
      throw new Error(`[${this.getName()}] Initiation failed.`);
    }
    
    // Step 3: Confirm
    const isConfirmed = await this.confirm(request);
    if (!isConfirmed) {
      console.error(`[${this.getName()}] Confirmation failed.`);
      throw new Error(`[${this.getName()}] Confirmation failed.`);
    }
    
    console.log(`[${this.getName()}] Payment completed successfully!`);
    return true;
  }

  // Abstract steps to be implemented by concrete gateways
  protected abstract validate(request: PaymentRequest): Promise<boolean>;
  protected abstract initiate(request: PaymentRequest): Promise<boolean>;
  protected abstract confirm(request: PaymentRequest): Promise<boolean>;
  
  // Helper to identify gateway
  public abstract getName(): string;
}

// Concrete Stripe Gateway
export class StripeGateway extends PaymentGateway {
  public getName(): string {
    return "StripeGateway";
  }

  protected async validate(request: PaymentRequest): Promise<boolean> {
    console.log(`[Stripe] Validating transaction...`);
    if (request.amount <= 0) {
      console.error("[Stripe] Validation failed: Amount must be greater than 0");
      return false;
    }
    // Check supported Stripe currencies
    const supportedCurrencies = ["USD", "INR", "EUR", "GBP", "CAD"];
    if (!supportedCurrencies.includes(request.currency.toUpperCase())) {
      console.error(`[Stripe] Validation failed: Unsupported currency ${request.currency}`);
      return false;
    }
    if (!request.sender || !request.receiver) {
      console.error("[Stripe] Validation failed: Missing sender or receiver info");
      return false;
    }
    return true;
  }

  protected async initiate(request: PaymentRequest): Promise<boolean> {
    console.log(`[Stripe] Initiating mock HTTP call to Stripe API endpoint /v1/payment_intents...`);
    // Simulate minor network delay or random transient error to test retry
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    // Simulate realistic flaky banking system behavior (1 in 5 chance of transient error)
    if (Math.random() < 0.20) {
      console.error("[Stripe] API Gateway timeout on /v1/payment_intents (Transient Error)");
      throw new Error("Stripe API transient timeout");
    }
    
    console.log(`[Stripe] Mock payment intent created successfully.`);
    return true;
  }

  protected async confirm(request: PaymentRequest): Promise<boolean> {
    console.log(`[Stripe] Verifying Stripe webhook / client secret verification status...`);
    await new Promise((resolve) => setTimeout(resolve, 50));
    return true;
  }
}

// Concrete Razorpay Gateway
export class RazorpayGateway extends PaymentGateway {
  public getName(): string {
    return "RazorpayGateway";
  }

  protected async validate(request: PaymentRequest): Promise<boolean> {
    console.log(`[Razorpay] Validating transaction...`);
    if (request.amount <= 0) {
      console.error("[Razorpay] Validation failed: Amount must be greater than 0");
      return false;
    }
    // Check supported Razorpay currencies
    const supportedCurrencies = ["INR", "USD"];
    if (!supportedCurrencies.includes(request.currency.toUpperCase())) {
      console.error(`[Razorpay] Validation failed: Unsupported currency ${request.currency}`);
      return false;
    }
    return true;
  }

  protected async initiate(request: PaymentRequest): Promise<boolean> {
    console.log(`[Razorpay] Initiating mock HTTP call to Razorpay API endpoint /v1/orders...`);
    await new Promise((resolve) => setTimeout(resolve, 120));
    
    // Simulate realistic flaky banking system behavior (1 in 5 chance of transient error)
    if (Math.random() < 0.20) {
      console.error("[Razorpay] Order creation connection reset by Razorpay server (Transient Error)");
      throw new Error("Razorpay connection reset");
    }
    
    console.log(`[Razorpay] Mock order ID created successfully.`);
    return true;
  }

  protected async confirm(request: PaymentRequest): Promise<boolean> {
    console.log(`[Razorpay] Verifying HMAC SHA256 payment signature on server...`);
    await new Promise((resolve) => setTimeout(resolve, 60));
    return true;
  }
}
