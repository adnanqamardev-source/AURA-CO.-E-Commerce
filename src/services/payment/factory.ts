import { GatewayType, IPaymentGateway } from "../../types/payment";
import { StripeGateway, RazorpayGateway } from "./gateways";
import { PaymentGatewayProxy } from "./proxy";

export class GatewayFactory {
  public static createGateway(type: GatewayType): IPaymentGateway {
    let concreteGateway: IPaymentGateway;

    switch (type) {
      case GatewayType.STRIPE:
        concreteGateway = new StripeGateway();
        break;
      case GatewayType.RAZORPAY:
        concreteGateway = new RazorpayGateway();
        break;
      default:
        throw new Error(`Unsupported gateway type: ${type}`);
    }

    return new PaymentGatewayProxy(concreteGateway);
  }
}
