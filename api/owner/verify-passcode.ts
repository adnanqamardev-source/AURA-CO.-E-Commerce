export default function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed." });
  }

  try {
    const { username, passcode } = req.body || {};

    if (typeof username !== "string" || typeof passcode !== "string") {
      return res.status(400).json({ success: false, error: "Invalid input types. Credentials must be strings." });
    }

    if (username.length > 100 || passcode.length > 100) {
      return res.status(400).json({ success: false, error: "Credentials exceed maximum allowed length." });
    }

    const configuredUsername = (process.env.AURA_OWNER_USERNAME || "admin").trim().toLowerCase();
    const configuredPasscode = process.env.AURA_OWNER_PASSCODE || "admin123";

    if (username.trim().toLowerCase() === configuredUsername && passcode === configuredPasscode) {
      return res.status(200).json({ success: true });
    }

    return res.status(401).json({ success: false, error: "Invalid credentials. Please verify your passcode." });
  } catch (error: any) {
    console.error("Owner Auth Vercel Handler Error:", error);
    return res.status(500).json({ success: false, error: "An internal server error occurred." });
  }
}
