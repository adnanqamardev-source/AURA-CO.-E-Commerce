import { Router, Request, Response } from "express";
import { GatewayType, PaymentRequest } from "../types/payment";
import { PaymentService } from "../services/payment/service";

export const paymentRouter = Router();

paymentRouter.post("/checkout", async (req: Request, res: Response) => {
  try {
    const { gatewayType, paymentRequest } = req.body;

    // Validation
    if (!gatewayType || !paymentRequest) {
      return res.status(400).json({
        success: false,
        error: "Missing gatewayType or paymentRequest in request body.",
      });
    }

    if (!Object.values(GatewayType).includes(gatewayType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid gatewayType. Allowed types: ${Object.values(GatewayType).join(", ")}`,
      });
    }

    const { amount, currency, sender, receiver, transactionType } = paymentRequest as PaymentRequest;

    if (
      typeof amount !== "number" ||
      amount <= 0 ||
      typeof currency !== "string" ||
      !currency ||
      typeof sender !== "string" ||
      !sender ||
      typeof receiver !== "string" ||
      !receiver ||
      (transactionType !== "ONE_TIME" && transactionType !== "RECURRING")
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid or missing field in paymentRequest details.",
      });
    }

    const paymentService = PaymentService.getInstance();
    const success = await paymentService.executePayment(gatewayType, paymentRequest);

    if (success) {
      return res.json({
        success: true,
        message: "Payment processed successfully.",
      });
    } else {
      return res.status(400).json({
        success: false,
        error: "Payment gateway validation or processing failed.",
      });
    }
  } catch (error: any) {
    console.error("[PaymentController] Error executing payment:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "An unexpected error occurred during payment processing.",
    });
  }
});
