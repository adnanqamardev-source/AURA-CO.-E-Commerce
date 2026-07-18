import { GatewayType } from "../types/payment";
import { PaymentGateway, StripeGateway, RazorpayGateway } from "./gateways";
import { PaymentGatewayProxy } from "./PaymentGatewayProxy";

export class GatewayFactory {
  /**
   * Factory method to obtain a proxy-wrapped PaymentGateway
   * @param type GatewayType (STRIPE or RAZORPAY)
   * @returns A proxy-wrapped PaymentGateway instance protected by retry mechanisms
   */
  public static createGateway(type: GatewayType): PaymentGateway {
    let concreteGateway: PaymentGateway;

    switch (type) {
      case GatewayType.STRIPE:
        concreteGateway = new StripeGateway();
        break;
      case GatewayType.RAZORPAY:
        concreteGateway = new RazorpayGateway();
        break;
      default:
        // Type-safety fallback
        const exhaustiveCheck: never = type;
        throw new Error(`Unsupported gateway type: ${exhaustiveCheck}`);
    }

    // Wrap in Proxy to ensure automatic exponential backoff resilience
    console.log(`[GatewayFactory] Created ${type} gateway, wrapping in PaymentGatewayProxy`);
    return new PaymentGatewayProxy(concreteGateway);
  }
}
