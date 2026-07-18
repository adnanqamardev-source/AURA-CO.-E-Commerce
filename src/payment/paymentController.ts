import { Router, Request, Response } from "express";
import { GatewayType, PaymentRequest } from "../types/payment";
import { PaymentService } from "./PaymentService";

export const paymentRouter = Router();

/**
 * POST /api/payment/checkout
 * Request body schema:
 * {
 *   "gatewayType": "STRIPE" | "RAZORPAY",
 *   "paymentRequest": {
 *     "amount": number,
 *     "currency": string,
 *     "sender": string,
 *     "receiver": string,
 *     "transactionType": "ONE_TIME" | "RECURRING"
 *   }
 * }
 */
paymentRouter.post("/checkout", async (req: Request, res: Response) => {
  try {
    const { gatewayType, paymentRequest } = req.body;

    // 1. Validation of request body parameters
    if (!gatewayType) {
      return res.status(400).json({ error: "Missing required parameter: gatewayType" });
    }

    if (!paymentRequest) {
      return res.status(400).json({ error: "Missing required parameter: paymentRequest" });
    }

    // Validate gateway type is standard enum value
    if (!Object.values(GatewayType).includes(gatewayType as GatewayType)) {
      return res.status(400).json({
        error: `Invalid gatewayType. Allowed values are: ${Object.values(GatewayType).join(", ")}`,
      });
    }

    const { amount, currency, sender, receiver, transactionType } = paymentRequest as PaymentRequest;

    if (amount === undefined || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ error: "Invalid payment amount. Must be a number greater than 0." });
    }

    if (!currency || typeof currency !== "string") {
      return res.status(400).json({ error: "Invalid currency. Must be a non-empty string." });
    }

    if (!sender || typeof sender !== "string") {
      return res.status(400).json({ error: "Invalid sender info." });
    }

    if (!receiver || typeof receiver !== "string") {
      return res.status(400).json({ error: "Invalid receiver info." });
    }

    if (transactionType !== "ONE_TIME" && transactionType !== "RECURRING") {
      return res.status(400).json({
        error: "Invalid transactionType. Allowed values are: 'ONE_TIME' or 'RECURRING'",
      });
    }

    // 2. Process payment via the PaymentService Singleton
    const paymentService = PaymentService.getInstance();
    const result = await paymentService.checkout(gatewayType as GatewayType, {
      amount: Number(amount),
      currency,
      sender,
      receiver,
      transactionType,
    });

    if (result.success) {
      return res.json({
        success: true,
        message: result.message,
        auditId: result.auditId,
        ledgerEntry: result.ledgerEntry,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.message,
        auditId: result.auditId,
        ledgerEntry: result.ledgerEntry,
      });
    }
  } catch (error: any) {
    console.error("Express Error in /checkout payment routing:", error);
    return res.status(500).json({
      error: "An internal server error occurred while routing the payment process.",
    });
  }
});

/**
 * GET /api/payment/ledger
 * Expose historical ledger lists for audit, transparency and compliance checking.
 */
paymentRouter.get("/ledger", (req: Request, res: Response) => {
  try {
    const paymentService = PaymentService.getInstance();
    return res.json({ ledger: paymentService.getLedger() });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load audit ledger." });
  }
});
