# Firebase & Google Cloud Run Platform Setup Guide

This guide provides a comprehensive, step-by-step walkthrough to help you understand, configure, and operate the Aura & Co. full-stack application on the new **Google AI Studio Build** cloud platform, integrating **Firebase Services** (Authentication & Firestore) for persistent data storage.

---

## 1. Cloud Run Container & Dev Platform Architecture
Aura & Co. runs inside a secure, scalable container on **Google Cloud Run**, orchestrated by Google AI Studio's development workspace:

* **Port 3000 Ingress Routing:** The Cloud Run container runs behind an Nginx reverse proxy layer that routes all external public traffic exclusively to **Port 3000**. All development and production servers must be configured to bind to host `0.0.0.0` on port `3000`.
* **Full-Stack Bundle Resolution:** In production, the system compiles the Vite React assets into a static distribution directory (`dist/`), and bundles the Express TypeScript backend (`server.ts`) into a single CommonJS file (`dist/server.cjs`) using `esbuild`. This eliminates Node ESM import resolution failures in serverless environments.
* **Serverless Entry Point:** In production, the app starts via the `"start"` script calling `node dist/server.cjs`, launching Express to serve both backend `/api/*` endpoints and serve compiled static SPA files.

---

## 2. Dynamic Firebase Integration Overview
The platform connects with **Google Firebase** to provide secure consumer profiles and real-time database synchronization:

1. **`firebase-blueprint.json`:** The declarative Intermediate Representation (IR) defining Firestore database entities (`Cart`, `Order`, `Product`) and their paths.
2. **`firebase-applet-config.json`:** Dynamic credential configuration file injected by the AI Studio environment. It is automatically imported inside the client-side Firebase utilities to instantiate connection pools.
3. **`firestore.rules`:** Active firewall security logic deployed to Firestore to guard customer information.

---

## 3. Step-by-Step Platform Setup Walkthrough

### Step 1: Provisioning Firestore & Authentication
1. Run the `set_up_firebase` workspace tool with platform set to `web`.
2. Confirm the Firebase terms in the interactive UI displayed inside Google AI Studio.
3. Once accepted, AI Studio provisions a Firebase Firestore database (e.g., `ai-studio-ecommercestore-...`) and writes credentials directly to `/firebase-applet-config.json`.

### Step 2: Configuring Authentication Providers in Firebase Console
To allow customers to sign in, the store owner must enable auth methods inside the [Firebase Console](https://console.firebase.google.com/):

#### A. Email/Password Provider
1. Navigate to **Authentication > Sign-in method**.
2. Click **Add new provider** and select **Email/Password**.
3. Toggle the provider to **Enabled** and click **Save**.

#### B. Google Identity Sign-In
1. Click **Add new provider** and select **Google**.
2. Toggle to **Enabled**, choose the project support email, and click **Save**.

#### C. Phone Number SMS Auth Protocol (SMS Access)
1. Click **Add new provider** and select **Phone**.
2. Toggle to **Enabled**.
3. *(Optional for Testing)* Expand **Phone numbers for testing (optional)**.
   - Enter a test phone number (e.g., `+1 555-0199`) and a verification code (e.g., `123456`).
   - This allows you to log in instantly during development without consuming active Twilio/Firebase SMS credits.
4. Click **Save**.

---

## 4. How Phone SMS Authentication Operates Under the Hood
To keep authentication secure and frictionless, Phone sign-in uses an advanced handshake protocol:

```text
[Customer UI]                           [App Firebase Utility]               [Firebase Auth Service]
      │                                            │                                     │
      ├─ 1. Inputs E.164 (+15551234567) ──────────>│                                     │
      │                                            ├─ 2. Initializes Invisible ──────────> [Verify Bot]
      │                                            │    reCAPTCHA Verifier               │ (No grid puzzle!)
      │                                            │                                     │
      │                                            ├─ 3. signInWithPhoneNumber ─────────>│
      │                                            │                                     ├─ 4. Generates SMS Code
      │                                            │                                     │
      │<─ 5. Receives 6-Digit Code (SMS) ──────────┼─────────────────────────────────────┤
      │                                            │                                     │
      ├─ 6. Inputs 6-digit Code (e.g. 123456) ────>│                                     │
      │                                            ├─ 7. confirmationResult.confirm() ──>│
      │                                            │                                     ├─ 8. Authorizes Profile
      │<─ 9. Handshake Confirmed (Welcome!) ───────┼<────────────────────────────────────┤
```

### Recaptcha Invisible Verification
To avoid forcing Meera (the lifestyle boutique buyer) to click pictures of fire hydrants or traffic lights, we bind an `Invisible` reCAPTCHA verifier:
```typescript
const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
  size: "invisible",
  callback: () => {
    // reCAPTCHA solved silently
  }
});
```
This verifier attaches to an invisible DOM element `<div id="recaptcha-container"></div>` at the bottom of the modal, executing a background heuristic check to verify human interaction before sending the SMS.

---

## 5. Compiling and Deploying Database Firewalls (Security Rules)
To deploy changes made to `firestore.rules`, use AI Studio's dynamic CLI tools:

1. Validate rules matches with those defined in `/firestore.rules`.
2. Run the deployment tool:
   ```bash
   deploy_firebase
   ```
3. This uploads and activates permissions on the Cloud database instance instantly, protecting real-time collections from data tampering.

---

## 6. Local Development and Dependency Management
To develop or customize Aura & Co. locally, run the following guidelines:

### Dependency Installation
We utilize the modular **Firebase Web SDK v10/v12** which allows tree-shaking and compiles small bundles. Install standard dependencies using NPM:
```bash
npm install firebase
```

### Running the Development Environment
Start the full-stack server using TSX, which auto-loads environments and spins up Vite:
```bash
npm run dev
```
Open `http://localhost:3000` to preview. Every change to front-end or back-end files will reload the serverless runtime automatically.

### Verifying Code Quality
Always check TypeScript type safety and compile capabilities before requesting production deployment:
```bash
npm run lint   # Compiles with tsc --noEmit to verify deep type-safety
npm run build  # Builds bundle packages and generates production server distributions
```
