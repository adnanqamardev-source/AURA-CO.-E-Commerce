import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { app } from "../server";
import { Server } from "http";

describe("Security & Authentication Endpoints Integration", () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(() => {
    // Override passcode env specifically for test environment predictability
    process.env.AURA_OWNER_PASSCODE = "admin123";

    return new Promise<void>((resolve) => {
      // Start server on a dynamic port to avoid conflicts
      server = app.listen(0, "127.0.0.1", () => {
        const address = server.address();
        if (address && typeof address !== "string") {
          baseUrl = `http://127.0.0.1:${address.port}`;
        }
        resolve();
      });
    });
  });

  afterAll(() => {
    return new Promise<void>((resolve) => {
      if (server) {
        server.close(() => resolve());
      } else {
        resolve();
      }
    });
  });

  it("authorizes successfully with correct credentials (admin / admin123)", async () => {
    const response = await fetch(`${baseUrl}/api/owner/verify-passcode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", passcode: "admin123" }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it("blocks access with incorrect passcode", async () => {
    const response = await fetch(`${baseUrl}/api/owner/verify-passcode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", passcode: "wrongpass1" }),
    });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain("Invalid credentials");
  });

  it("guards against non-string input type confusion (Security Vulnerability check)", async () => {
    const response = await fetch(`${baseUrl}/api/owner/verify-passcode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", passcode: { test: true } }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain("Invalid input types");
  });

  it("guards against empty parameters", async () => {
    const response = await fetch(`${baseUrl}/api/owner/verify-passcode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "", passcode: "" }),
    });

    expect(response.status).toBe(401); // Correct admin credentials are empty so this fails auth
    const data = await response.json();
    expect(data.success).toBe(false);
  });

  it("limits parameter lengths to avoid DoS payload vulnerabilities", async () => {
    const overlyLongPasscode = "a".repeat(150);
    const response = await fetch(`${baseUrl}/api/owner/verify-passcode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", passcode: overlyLongPasscode }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain("Credentials exceed maximum allowed length");
  });
});
