import { GatewayType, PaymentRequest } from "../../types/payment";
import { GatewayFactory } from "./factory";

export class PaymentService {
  private static instance: PaymentService | null = null;

  // Private constructor to prevent direct instantiation
  private constructor() {}

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  public async executePayment(
    gatewayType: GatewayType,
    request: PaymentRequest
  ): Promise<boolean> {
    console.log(`[PaymentService] Routing request to GatewayFactory for ${gatewayType}`);
    const gateway = GatewayFactory.createGateway(gatewayType);
    return await gateway.processPayment(request);
  }
}
