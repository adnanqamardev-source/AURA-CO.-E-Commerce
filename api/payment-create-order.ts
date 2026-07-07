/**
 * Standalone Vercel Serverless Function — Razorpay Payment Verification
 *
 * Isolated from `server.ts` (the Express app) to avoid the
 * ERR_MODULE_NOT_FOUND crash on Vercel. Uses only Node's built-in `crypto`.
 *
 * Route: POST /api/payment/verify
 */

import crypto from "crypto";

const RAZORPAY_KEY_SECRET =
  process.env.RAZORPAY_KEY_SECRET || "33tvlmPudUcueWNiyzchBaI2";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, error: "Method not allowed." });
    return;
  }

  let razorpay_order_id: unknown;
  let razorpay_payment_id: unknown;
  let razorpay_signature: unknown;
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    razorpay_order_id = body.razorpay_order_id;
    razorpay_payment_id = body.razorpay_payment_id;
    razorpay_signature = body.razorpay_signature;
  } catch {
    res.status(400).json({ success: false, error: "Invalid request body." });
    return;
  }

  if (
    typeof razorpay_order_id !== "string" ||
    typeof razorpay_payment_id !== "string" ||
    typeof razorpay_signature !== "string"
  ) {
    res.status(400).json({ success: false, error: "Missing payment verification parameters." });
    return;
  }

  try {
    const generatedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature === razorpay_signature) {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false, error: "Invalid payment signature." });
    }
  } catch (error: any) {
    console.error("Razorpay verify error:", error);
    res.status(500).json({ success: false, error: "Payment verification failed." });
  }
}