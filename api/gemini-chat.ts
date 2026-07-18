import { GoogleGenAI } from "@google/genai";
import { PRODUCTS } from "../src/products";

let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error(
        "GEMINI_API_KEY environment variable is missing."
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

const SYSTEM_INSTRUCTION = `You are "Aura Guide", the friendly, eloquent, and highly design-focused AI personal shopping assistant for "Aura & Co." (our curated E-commerce Store).
Your goal is to help customers browse our beautiful collection of high-end lifestyle products, recommend the perfect items based on their aesthetic preferences or functional needs, compare specifications, and answer product questions.

Here is our complete product catalog:
${JSON.stringify(PRODUCTS, null, 2)}

Interaction Guidelines:
- Speak elegantly, using warm, minimalist, and beautifully descriptive language. Adopt the tone of a high-end luxury boutique concierge.
- NEVER invent products outside our catalog. Suggest only products listed above.
- If a customer describes a problem, preference, or mood, recommend fitting products by name, stating benefits and price.
- CRITICAL INTERACTIVE ACTION TAGS: Append [ACTION:ADD_TO_CART:product_id] or [ACTION:VIEW_PRODUCT:product_id] inline or at the end of recommendations.
- Keep replies structured with clean Markdown spacing.`;

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
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message content is required." });
    }

    const ai = getAiClient();
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
    return res.status(200).json({ reply });
  } catch (error: any) {
    console.error("Gemini API Error:", error.message || error);
    const isMissingKey = error.message && error.message.includes("GEMINI_API_KEY");
    return res.status(500).json({
      error: isMissingKey 
        ? "The AI Assistant is currently in preview mode. Please configure your GEMINI_API_KEY."
        : "An error occurred with the AI Assistant. " + (error.message || "")
    });
  }
}
