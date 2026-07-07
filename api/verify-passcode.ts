/**
 * Standalone Vercel Serverless Function — Owner Passcode Verification
 *
 * This function is intentionally isolated from `server.ts` (the Express app)
 * to avoid the ERR_MODULE_NOT_FOUND crash that occurs when Vercel tries to
 * import `/var/task/server` (which is never compiled to a standalone module
 * in the serverless build). It has ZERO external dependencies so it can never
 * fail at module-load time.
 *
 * Route: POST /api/owner/verify-passcode
 */

interface VerifyRequestBody {
  username?: unknown;
  passcode?: unknown;
}

export default function handler(req: any, res: any) {
  // Only allow POST
  if (req.method !== "POST") {
    res.status(405).json({ success: false, error: "Method not allowed." });
    return;
  }

  // Vercel auto-parses JSON bodies into req.body, but fall back to reading
  // the raw stream for other Node runtimes so this never crashes.
  const parseBody = (): Promise<VerifyRequestBody> => {
    if (req.body && typeof req.body === "object") {
      return Promise.resolve(req.body as VerifyRequestBody);
    }
    return new Promise((resolve) => {
      let raw = "";
      req.on("data", (chunk: any) => (raw += chunk));
      req.on("end", () => {
        try {
          resolve(raw ? JSON.parse(raw) : {});
        } catch {
          resolve({});
        }
      });
      req.on("error", () => resolve({}));
    });
  };

  parseBody()
    .then((body) => {
      const { username, passcode } = body;

      // Guard against non-string inputs (prevents parameter injection / crashes)
      if (typeof username !== "string" || typeof passcode !== "string") {
        res.status(400).json({
          success: false,
          error: "Invalid input types. Credentials must be strings.",
        });
        return;
      }

      // Limit input length to avoid DoS / buffer issues
      if (username.length > 100 || passcode.length > 100) {
        res.status(400).json({
          success: false,
          error: "Credentials exceed maximum allowed length.",
        });
        return;
      }

      const configuredUsername = (process.env.AURA_OWNER_USERNAME || "admin")
        .trim()
        .toLowerCase();
      const configuredPasscode = process.env.AURA_OWNER_PASSCODE || "admin123";

      if (
        username.trim().toLowerCase() === configuredUsername &&
        passcode === configuredPasscode
      ) {
        res.status(200).json({ success: true });
        return;
      }

      res.status(401).json({
        success: false,
        error: "Invalid credentials. Please verify your passcode.",
      });
    })
    .catch((error: any) => {
      console.error("Owner Auth Error:", error);
      res.status(500).json({
        success: false,
        error: "An internal server error occurred during authentication.",
      });
    });
}