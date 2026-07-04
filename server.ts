import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import shared product list
import { PRODUCTS } from "./src/products";

// Initialize express app
export const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

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

    const configuredPasscode = process.env.AURA_OWNER_PASSCODE || "admin123";

    if (username.trim().toLowerCase() === "admin" && passcode === configuredPasscode) {
      return res.json({ success: true });
    }
    return res.status(401).json({ success: false, error: "Invalid credentials. Please verify your passcode." });
  } catch (error: any) {
    console.error("Owner Auth Error:", error);
    return res.status(500).json({ success: false, error: "An internal server error occurred." });
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

// Only start the server if not running in a test environment
if (process.env.NODE_ENV !== "test" && !process.env.VITEST) {
  setupServer().catch((err) => {
    console.error("Failed to start server:", err);
  });
}
