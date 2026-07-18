import crypto from "crypto";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Handle simulation fallback
    if (!keySecret || process.env.RAZORPAY_KEY_ID === "rzp_test_fallback") {
      console.log("Simulating order verification success due to missing key secret or test fallback");
      return res.status(200).json({ status: "success", verified: true, is_simulated: true });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", keySecret)
      .update(sign.toString())
      .digest("hex");

    if (expectedSign === razorpay_signature) {
      return res.status(200).json({ status: "success", verified: true });
    } else {
      return res.status(400).json({ status: "failure", verified: false, error: "Invalid signature" });
    }
  } catch (error: any) {
    console.error("Payment Verification Error:", error);
    return res.status(500).json({ error: error.message || "Verification failed" });
  }
}
