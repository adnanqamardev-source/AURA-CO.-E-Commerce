import { IPaymentGateway, PaymentRequest } from "../../types/payment";

export class PaymentGatewayProxy implements IPaymentGateway {
  private maxRetries = 3;
  private baseDelayMs = 200;

  constructor(private gateway: IPaymentGateway) {}

  public async processPayment(request: PaymentRequest): Promise<boolean> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = this.baseDelayMs * Math.pow(2, attempt - 1);
          console.log(
            `[PaymentGatewayProxy] Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        const result = await this.gateway.processPayment(request);
        return result;
      } catch (error: any) {
        lastError = error;
        console.warn(
          `[PaymentGatewayProxy] Exception during processPayment on attempt ${attempt + 1}: ${
            error.message || error
          }`
        );
      }
    }

    console.error(
      `[PaymentGatewayProxy] All ${this.maxRetries + 1} attempts failed. Propagation error.`
    );
    throw lastError || new Error("Payment processing failed after retries.");
  }
}
