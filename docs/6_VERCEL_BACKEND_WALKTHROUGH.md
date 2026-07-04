# Hosting on Vercel & Establishing Your Own Backend Walkthrough

This guide provides a very simple, step-by-step walkthrough to help you extract the Aura & Co. full-stack application, configure a custom Node.js Express backend, and host it successfully on **Vercel** with full secure environment variables.

---

## 1. How Vercel Handles Full-Stack Applications
Vercel is primarily optimized for static frontend hosting, but it fully supports running custom Node.js Express server backends via **Vercel Serverless Functions**.

To make your Express server run on Vercel, we will configure a simple `vercel.json` file at the root. This file tells Vercel's build container to:
1. Build the Vite React frontend into a static `dist/` directory.
2. Route any request starting with `/api` to our serverless entrypoint (`api/index.ts` or similar).

---

## 2. Step-by-Step Vercel Deployment Walkthrough

### Step 1: Export Your Project
Download the ZIP file of your Aura & Co. project from the AI Studio **Settings > Export to ZIP** menu, and unzip it locally on your computer.

### Step 2: Create Vercel Configuration File (`vercel.json`)
To coordinate the static frontend and the serverless Express backend, create a file named `vercel.json` in the root directory of your project:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "api/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

### Step 3: Adapt the Server Entrypoint for Vercel Serverless Space
Create a folder named `api` in your project root, and create a file named `index.ts` inside it (`api/index.ts`). Vercel expects an exported handler rather than a continuous `app.listen()` call for serverless runtimes.

Write the following inside `api/index.ts`:

```typescript
import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { PRODUCTS } from "../src/products";

// Load local environment variables
dotenv.config();

const app = express();
app.use(express.json());

// Initialize Gemini Client Lazily
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// -----------------------------------------------------------------
// 1. System instructions containing our full product catalog
// -----------------------------------------------------------------
const SYSTEM_INSTRUCTION = `You are "Aura Guide", the friendly, eloquent assistant for "Aura & Co."...`;

// -----------------------------------------------------------------
// 2. API route for Chat Assistant
// -----------------------------------------------------------------
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ error: "Message content is required." });

    const ai = getAiClient();
    const contents = [...(history || []), { role: "user", parts: [{ text: message }] }];

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return res.json({ reply: response.text || "I apologize, but I could not formulate a response." });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message || "An error occurred." });
  }
});

// -----------------------------------------------------------------
// 3. API route for Owner Passcode Verification
// -----------------------------------------------------------------
app.post("/api/owner/verify-passcode", (req, res) => {
  const { username, passcode } = req.body;
  const configuredPasscode = process.env.AURA_OWNER_PASSCODE || "admin123";

  if (username?.trim().toLowerCase() === "admin" && passcode === configuredPasscode) {
    return res.json({ success: true });
  }
  return res.status(401).json({ success: false, error: "Invalid credentials. Please verify your passcode." });
});

// Export the express app as a serverless function handler
export default app;
```

### Step 4: Deploy to GitHub
1. Create a new **private** or **public** repository on GitHub.
2. Initialize git in your project directory and push your code:
   ```bash
   git init
   git add .
   git commit -m "Initialize Aura & Co. Full-Stack Boutique"
   git branch -M main
   git remote add origin https://github.com/your-username/your-repo-name.git
   git push -u origin main
   ```

### Step 5: Link GitHub to Vercel & Inject Secrets
1. Go to the [Vercel Dashboard](https://vercel.com/) and click **Add New > Project**.
2. Select your repository from GitHub and click **Import**.
3. Under the **Environment Variables** section, configure the following secrets so they are never leaked:
   - **`GEMINI_API_KEY`**: Paste your Gemini secret key here (obtained from Google AI Studio).
   - **`AURA_OWNER_PASSCODE`**: Create a custom passcode for your Store Owner login (e.g. `MaisonAura789`). If not set, it defaults to `admin123`.
4. Click **Deploy**! 

Within 60 seconds, your frontend is served globally, and your secure backend serverless functions are active and listening automatically!
