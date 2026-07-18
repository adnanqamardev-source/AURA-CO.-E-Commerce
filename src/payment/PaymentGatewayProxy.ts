import { PaymentRequest } from "../types/payment";
import { PaymentGateway } from "./gateways";

export class PaymentGatewayProxy extends PaymentGateway {
  private gateway: PaymentGateway;

  constructor(gateway: PaymentGateway) {
    super();
    this.gateway = gateway;
  }

  public getName(): string {
    return `Proxy(${this.gateway.getName()})`;
  }

  // Delegated implementation of abstract methods (in case they are called directly)
  protected async validate(request: PaymentRequest): Promise<boolean> {
    // Using a type cast to access protected methods, or invoking on instance
    return (this.gateway as any).validate(request);
  }

  protected async initiate(request: PaymentRequest): Promise<boolean> {
    return (this.gateway as any).initiate(request);
  }

  protected async confirm(request: PaymentRequest): Promise<boolean> {
    return (this.gateway as any).confirm(request);
  }

  // Intercept the template method call to add Resilience and Exponential Backoff Retry
  public override async processPayment(request: PaymentRequest): Promise<boolean> {
    const maxRetries = 3;
    let delay = 1000; // base delay of 1 second

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        console.log(`[PaymentGatewayProxy] Delegating payment to ${this.gateway.getName()} (Attempt ${attempt} of ${maxRetries + 1})`);
        const result = await this.gateway.processPayment(request);
        return result;
      } catch (error: any) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        
        if (attempt <= maxRetries) {
          console.warn(
            `[PaymentGatewayProxy] Attempt ${attempt} failed with: "${errorMsg}". ` +
            `Retrying in ${delay}ms (exponential backoff)...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2; // Double the delay
        } else {
          console.error(
            `[PaymentGatewayProxy] All ${maxRetries + 1} attempts to pay via ` +
            `${this.gateway.getName()} failed. Raising exception.`
          );
          throw new Error(
            `Payment process failed after ${maxRetries + 1} attempts. Last error: ${errorMsg}`
          );
        }
      }
    }
    return false;
  }
}
