import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import crypto from "crypto";

// Load environment variables
dotenv.config();

// Import shared product list
import { PRODUCTS } from "./src/products";
import { paymentRouter } from "./src/payment/paymentController";

// Initialize express app
export const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Mount our resilient payment processing endpoints
app.use("/api/payment", paymentRouter);

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error(
        "GEMINI_API_KEY environment variable is missing. Please configure it in your AI Studio Settings > Secrets panel."
      );
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// System instructions containing our full product catalog and behavioral goals
const SYSTEM_INSTRUCTION = `You are "Aura Guide", the friendly, eloquent, and highly design-focused AI personal shopping assistant for "Aura & Co." (our curated E-commerce Store).
Your goal is to help customers browse our beautiful collection of high-end lifestyle products, recommend the perfect items based on their aesthetic preferences or functional needs, compare specifications, and answer product questions.

Here is our complete product catalog:
${JSON.stringify(PRODUCTS, null, 2)}

Interaction Guidelines:
- Speak elegantly, using warm, minimalist, and beautifully descriptive language. Adopt the tone of a high-end luxury boutique concierge.
- NEVER invent products outside our catalog. Suggest only products listed above.
- If a customer describes a problem, preference, or mood (e.g. "I want to relax", "my desk is cluttered", "looking for soft bedding"), think about which products fit best and recommend them by name, stating their key benefits and price.
- You can suggest multiple items, but keep recommendations tailored.
- CRITICAL INTERACTIVE ACTION TAGS: You can trigger actions in our storefront. Whenever you recommend a specific product from our catalog, append these exact custom tags inline or at the end of your paragraphs so the storefront can render interactive quick-action buttons next to your message:
  - To suggest adding a product to the cart: use the exact tag [ACTION:ADD_TO_CART:product_id]
  - To suggest opening/viewing a product detail view: use the exact tag [ACTION:VIEW_PRODUCT:product_id]
  
  Example message:
  "For your desk setup, the **Halogen Brass Pen Tray** ($45) would be an exquisite anchor. It is solid brass and will gain a gorgeous patina. You can view its technical specifications here [ACTION:VIEW_PRODUCT:prod-2] or, if you are ready to elevate your desk, I can add it to your cart for you: [ACTION:ADD_TO_CART:prod-2]."

- Keep your replies relatively concise and structured with clean Markdown spacing, making them easy to read.`;

// API route for chat assistant
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message content is required." });
    }

    const ai = getAiClient();

    // Construct content history. Each item is: { role: "user"|"model", parts: [{ text: string }] }
    const contents = [...(history || [])];
    contents.push({ role: "user", parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const reply = response.text || "I apologize, but I could not formulate a response at this moment.";
    return res.json({ reply });
  } catch (error: any) {
    console.error("Gemini API Error:", error.message || error);
    const isMissingKey = error.message && error.message.includes("GEMINI_API_KEY");
    return res.status(500).json({
      error: isMissingKey 
        ? "The AI Assistant is currently in preview mode. Please configure your GEMINI_API_KEY in the AI Studio Settings > Secrets panel."
        : "An error occurred with the AI Assistant. " + (error.message || "")
    });
  }
});

// API route for owner passcode verification
app.post("/api/owner/verify-passcode", (req, res) => {
  try {
    const { username, passcode } = req.body;

    // Security check: Guard against non-string inputs (prevents parameter injection or server crashes)
    if (typeof username !== "string" || typeof passcode !== "string") {
      return res.status(400).json({ success: false, error: "Invalid input types. Credentials must be strings." });
    }

    // Security check: Limit input length to avoid DoS/buffer size issues
    if (username.length > 100 || passcode.length > 100) {
      return res.status(400).json({ success: false, error: "Credentials exceed maximum allowed length." });
    }

    const configuredUsername = (process.env.AURA_OWNER_USERNAME || "admin").trim().toLowerCase();
    const configuredPasscode = process.env.AURA_OWNER_PASSCODE || "admin123";

    if (username.trim().toLowerCase() === configuredUsername && passcode === configuredPasscode) {
      return res.json({ success: true });
    }
    return res.status(401).json({ success: false, error: "Invalid credentials. Please verify your passcode." });
  } catch (error: any) {
    console.error("Owner Auth Error:", error);
    return res.status(500).json({ success: false, error: "An internal server error occurred." });
  }
});

// GET /api/razorpay/config - returns Razorpay key_id safely
app.get("/api/razorpay/config", (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!keyId) {
    return res.status(404).json({ error: "Razorpay key not configured on server" });
  }
  res.json({ keyId });
});

// POST /api/razorpay/create-order - calls Razorpay API to create an order
app.post("/api/razorpay/create-order", async (req, res) => {
  try {
    const { amount, currency } = req.body;
    if (!amount || isNaN(Number(amount))) {
      return res.status(400).json({ error: "Valid amount is required" });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(500).json({ error: "Razorpay credentials are not configured on the server." });
    }

    // Razorpay amounts are in the smallest currency unit (e.g., paise for INR, cents for USD)
    const smallestUnitAmount = Math.round(Number(amount) * 100);
    const orderCurrency = (currency || "INR").toUpperCase();

    const authHeader = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify({
        amount: smallestUnitAmount,
        currency: orderCurrency,
        receipt: `receipt_${Date.now()}`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Razorpay Order Creation Failed:", data);
      return res.status(response.status).json({ error: data.error?.description || "Failed to create Razorpay order" });
    }

    return res.json({
      id: data.id,
      amount: data.amount,
      currency: data.currency,
    });
  } catch (error: any) {
    console.error("Razorpay create-order Error:", error);
    return res.status(500).json({ error: "Internal server error occurred while creating order" });
  }
});

// POST /api/razorpay/verify-signature - verifies signature securely on backend
app.post("/api/razorpay/verify-signature", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing required verification fields." });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({ error: "Razorpay credentials are not configured on the server." });
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      return res.json({ success: true, message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ success: false, error: "Invalid payment signature verification failed." });
    }
  } catch (error: any) {
    console.error("Razorpay verify-signature Error:", error);
    return res.status(500).json({ error: "Internal server error occurred during verification" });
  }
});

// Setup Express routing & Vite middleware based on environment
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite HMR...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode with static assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

// Only start the server if not running in a test environment or on Vercel
if (process.env.NODE_ENV !== "test" && !process.env.VITEST && !process.env.VERCEL) {
  setupServer().catch((err) => {
    console.error("Failed to start server:", err);
  });
}
