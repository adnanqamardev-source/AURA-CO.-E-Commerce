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
    const { amount, currency, receipt } = req.body;

    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_fallback";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "fallback_secret";

    // If test keys/fallback, we can simulate order creation
    if (keyId === "rzp_test_fallback") {
      return res.status(200).json({
        id: `order_${Math.random().toString(36).substr(2, 9)}`,
        entity: "order",
        amount: amount || 50000,
        amount_paid: 0,
        amount_due: amount || 50000,
        currency: currency || "INR",
        receipt: receipt || "receipt_1",
        status: "created",
        attempts: 0,
        notes: [],
        created_at: Math.floor(Date.now() / 1000),
        is_simulated: true,
      });
    }

    const authHeader = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: amount, // in smallest unit (paise)
        currency: currency || "INR",
        receipt: receipt,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Razorpay API response error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Create Order Error:", error);
    return res.status(500).json({ error: error.message || "Failed to create Razorpay order" });
  }
}
