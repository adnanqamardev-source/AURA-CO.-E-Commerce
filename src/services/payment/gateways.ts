import { IPaymentGateway, PaymentRequest } from "../../types/payment";

export abstract class PaymentGateway implements IPaymentGateway {
  // Template Method
  public async processPayment(request: PaymentRequest): Promise<boolean> {
    console.log(`[${this.getName()}] Starting payment process of ${request.amount} ${request.currency}`);

    const isValid = await this.validate(request);
    if (!isValid) {
      console.log(`[${this.getName()}] Validation failed.`);
      return false;
    }

    const isInitiated = await this.initiate(request);
    if (!isInitiated) {
      console.log(`[${this.getName()}] Initiation failed.`);
      return false;
    }

    const isConfirmed = await this.confirm(request);
    if (!isConfirmed) {
      console.log(`[${this.getName()}] Confirmation failed.`);
      return false;
    }

    console.log(`[${this.getName()}] Payment processed successfully.`);
    return true;
  }

  protected abstract getName(): string;
  protected abstract validate(request: PaymentRequest): Promise<boolean>;
  protected abstract initiate(request: PaymentRequest): Promise<boolean>;
  protected abstract confirm(request: PaymentRequest): Promise<boolean>;
}

export class StripeGateway extends PaymentGateway {
  private static initiationAttempts = 0;

  protected getName(): string {
    return "StripeGateway";
  }

  protected async validate(request: PaymentRequest): Promise<boolean> {
    console.log(`[Stripe] Validating request...`);
    if (request.amount <= 0) return false;
    // Stripe supported currencies
    const supported = ["USD", "EUR", "GBP", "CAD"];
    if (!supported.includes(request.currency.toUpperCase())) {
      console.log(`[Stripe] Currency ${request.currency} not supported.`);
      return false;
    }
    return true;
  }

  protected async initiate(request: PaymentRequest): Promise<boolean> {
    console.log(`[Stripe] Initiating mock HTTP call to Stripe API...`);
    
    // Simulate network failure on first attempt for testing
    if (request.sender === "transient_fail" && StripeGateway.initiationAttempts < 1) {
      StripeGateway.initiationAttempts++;
      console.log(`[Stripe] Simulating network connection timeout error...`);
      throw new Error("Stripe network timeout");
    }
    
    // Reset or keep counter
    if (request.sender === "fail_permanently") {
      throw new Error("Stripe permanent connection failure");
    }

    // Simulate standard HTTP latency
    await new Promise((resolve) => setTimeout(resolve, 100));
    return true;
  }

  protected async confirm(request: PaymentRequest): Promise<boolean> {
    console.log(`[Stripe] Verifying transaction success...`);
    await new Promise((resolve) => setTimeout(resolve, 50));
    return true;
  }
}

export class RazorpayGateway extends PaymentGateway {
  private static initiationAttempts = 0;

  protected getName(): string {
    return "RazorpayGateway";
  }

  protected async validate(request: PaymentRequest): Promise<boolean> {
    console.log(`[Razorpay] Validating request...`);
    if (request.amount <= 0) return false;
    // Razorpay supported currencies
    const supported = ["INR", "USD", "EUR"];
    if (!supported.includes(request.currency.toUpperCase())) {
      console.log(`[Razorpay] Currency ${request.currency} not supported.`);
      return false;
    }
    return true;
  }

  protected async initiate(request: PaymentRequest): Promise<boolean> {
    console.log(`[Razorpay] Initiating mock HTTP call to Razorpay API...`);
    
    // Simulate network failure on first attempt for testing
    if (request.sender === "transient_fail" && RazorpayGateway.initiationAttempts < 1) {
      RazorpayGateway.initiationAttempts++;
      console.log(`[Razorpay] Simulating network connection timeout error...`);
      throw new Error("Razorpay network timeout");
    }

    if (request.sender === "fail_permanently") {
      throw new Error("Razorpay permanent connection failure");
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
    return true;
  }

  protected async confirm(request: PaymentRequest): Promise<boolean> {
    console.log(`[Razorpay] Verifying transaction success...`);
    await new Promise((resolve) => setTimeout(resolve, 50));
    return true;
  }
}
