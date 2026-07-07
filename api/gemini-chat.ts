/**
 * Standalone Vercel Serverless Function — Gemini AI Concierge Chat
 *
 * Isolated from `server.ts` (the Express app) to avoid the
 * ERR_MODULE_NOT_FOUND crash that occurs when Vercel tries to import
 * `/var/task/server`. It imports only `@google/genai` (already a dependency)
 * and reads GEMINI_API_KEY from the environment.
 *
 * Route: POST /api/gemini/chat
 */

import { GoogleGenAI } from "@google/genai";

const PRODUCTS_JSON = process.env.AURA_PRODUCTS_OVERRIDE || "";

const SYSTEM_INSTRUCTION = `You are "Aura Guide", the friendly, eloquent, and highly design-focused AI personal shopping assistant for "Aura & Co." (our curated E-commerce Store).
Your goal is to help customers browse our beautiful collection of high-end lifestyle products, recommend the perfect items based on their aesthetic preferences or functional needs, compare specifications, and answer product questions.

Interaction Guidelines:
- Speak elegantly, using warm, minimalist, and beautifully descriptive language. Adopt the tone of a high-end luxury boutique concierge.
- NEVER invent products outside our catalog. Suggest only products listed above.
- If a customer describes a problem, preference, or mood, think about which products fit best and recommend them by name, stating their key benefits and price.
- You can suggest multiple items, but keep recommendations tailored.
- CRITICAL INTERACTIVE ACTION TAGS: Whenever you recommend a specific product from our catalog, append these exact custom tags inline or at the end of your paragraphs so the storefront can render interactive quick-action buttons next to your message:
  - To suggest adding a product to the cart: use the exact tag [ACTION:ADD_TO_CART:product_id]
  - To suggest opening/viewing a product detail view: use the exact tag [ACTION:VIEW_PRODUCT:product_id]
- Keep your replies relatively concise and structured with clean Markdown spacing, making them easy to read.`;

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  let message: unknown;
  let history: unknown;
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    message = body.message;
    history = body.history;
  } catch {
    res.status(400).json({ error: "Invalid request body." });
    return;
  }

  if (typeof message !== "string" || !message) {
    res.status(400).json({ error: "Message content is required." });
    return;
  }

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      res.status(500).json({
        error:
          "The AI Assistant is currently in preview mode. Please configure your GEMINI_API_KEY in the Vercel project environment.",
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });

    const contents: any[] = [...((history as any[]) || [])];
    contents.push({ role: "user", parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const reply =
      response.text || "I apologize, but I could not formulate a response at this moment.";
    res.status(200).json({ reply });
  } catch (error: any) {
    console.error("Gemini API Error:", error?.message || error);
    res.status(500).json({
      error:
        "An error occurred with the AI Assistant. " + (error?.message || ""),
    });
  }
}