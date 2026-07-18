# Technical Architecture Document

## 1. Tech Stack Overview
This full-stack application operates on a modern, ultra-fast TypeScript ecosystem designed for zero cold-starts, high responsive fidelity, and smooth animations.

- **Frontend Framework:** React 19 + TypeScript (strict mode).
- **Styling & CSS:** Tailwind CSS v4. Integrated as an elegant utility-first design compiler.
- **Animations:** `motion` (formerly framer-motion) imported via `motion/react` for smooth physical-based layout animations and drawer sweeps.
- **Backend Server:** Node.js + Express v4 + TypeScript.
- **Server Dev Runner:** `tsx` (TypeScript Execute) for instantaneous direct execution in development.
- **Production Bundle Compiler:** `vite` (for standard React assets) + `esbuild` compiling the backend server into a single bundled CommonJS (`dist/server.cjs`) to guarantee absolute environment portability and bypass Node's strict ESM resolution rules on cloud runtimes.
- **AI Integration:** `@google/genai` (modern Gemini SDK) proxying AI chat queries through server-side endpoints (`/api/chat`) to protect credentials.
- **Data Persistence Strategy:** Firebase Firestore + Local Storage Hybrid. Local state changes synchronize immediately to the user's browser `localStorage` for latency-free renders, and automatically sync to the secure Firebase Cloud Database (`db`) when the client is logged in.
- **Authentication Services:** Firebase Auth supporting standard email/password, Google Account single-sign-on, and secure **Phone Number Verification with SMS OTP** (using invisible reCAPTCHA Verifiers).

---

## 2. File & Folder Structure Map
The project is structurally divided into modular directories separating layout design, business logic, static data, and backend operations:

```text
├── docs/                             # Project Architecture Documentation
│   ├── 1_PRD.md                      # Product Requirements Document
│   ├── 2_TECHNICAL_ARCHITECTURE.md   # System Architecture blueprint
│   ├── 3_SECURITY_AND_ACCESS.md      # Access Control & Error Playbooks
│   ├── 4_FRONTEND_SPECIFICATION.md   # Design Tokens & UI Specs
│   ├── 5_FEATURE_TICKET_LIST.md      # Step-by-step Development Tickets
│   └── 6_FIREBASE_AND_CLOUD_RUN_SETUP.md # Firebase Setup, Phone SMS Auth and Cloud Run deployment
├── src/
│   ├── components/                   # Modular React UI Components
│   │   ├── AiConcierge.tsx           # AI chat floating drawer and logic
│   │   ├── CartSidebar.tsx           # Shopping bag, shipping details, UPI checkout
│   │   ├── Navbar.tsx                # Sticky top bar with navigation, currency, admin portal triggers
│   │   ├── OrderHistoryModal.tsx     # Past purchase records and loyalty system
│   │   ├── OwnerPanelModal.tsx       # Secured Lock screen + Store Admin Catalog & UPI gate controllers
│   │   ├── PolicyModal.tsx           # Interactive modal for Terms and Privacy policies
│   │   ├── UserAuthModal.tsx         # Firebase Multi-Protocol Authentication (Email, Google, Phone SMS)
│   │   └── ProductCard.tsx           # Individual product card UI with options
│   ├── utils/
│   │   ├── currency.ts               # Currency conversions, rates, symbol formatting
│   │   └── firebase.ts               # Firebase App, Firestore, and Auth initialization module
│   ├── App.tsx                       # Main layout coordinator and central state machine
│   ├── index.css                     # Tailwind v4 import, custom font setups & theme variables
│   ├── main.tsx                      # Vite React browser entrypoint
│   ├── products.ts                   # Standard curated product database and categories
│   └── types.ts                      # Shared TypeScript interface definitions
├── firebase-applet-config.json        # Compiled Firebase config keys (client credentials)
├── firebase-blueprint.json           # Declarative Intermediate Representation (IR) of Collections
├── firestore.rules                   # Real-time Cloud Firestore security permission files
├── server.ts                         # Full-stack Express server handling API endpoints and Vite development middleware
├── package.json                      # NPM configuration, dependencies and build scripts
├── vite.config.ts                    # Vite build configuration with React plugin
├── tsconfig.json                     # TypeScript compiler configurations
├── .env.example                      # Boilerplate environment variable documenter
└── metadata.json                     # System framework permissions and capabilities manifest
```

---

## 3. Databases & Hybrid State Schema
To guarantee instant response, offline resilience, and reliable state tracking across refreshing browser sessions and multi-device setups, all variables utilize a synchronized Hybrid Storage mechanism combining Local Storage cache and Firestore collections:

### A. Catalog Products Database
- **Primary Source:** Client state populated from original static catalog (`src/products.ts`) and dynamically overridden by the user's custom Firestore `products` entries.
- **Storage Sync:** Synced to `localStorage` under key `aura_products` and written to Firestore collection `products/{productId}` for admin modifications.

### B. Shopping Cart Schema
- **Local Storage Cache Key:** `aura_cart`
- **Firestore Collection Path:** `carts/{userId}`
- **Synchronization Logic:**
  1. In guest mode, cart changes are saved instantly in browser `localStorage`.
  2. When a user authenticates (via email, Google, or SMS), the local cache automatically uploads to Firestore under document `carts/{userId}`.
  3. Continuous cart additions trigger debounced Firestore writes, securing customer selections across devices.

### C. Orders & Loyalty Log Schema
- **Local Storage Cache Key:** `aura_orders`
- **Firestore Collection Path:** `orders/{orderId}`
- **Synchronization Logic:**
  1. On successful order checkout, the transaction record is generated and pushed to both local `localStorage` and Firestore's `orders` collection.
  2. The database records are queried in real-time on login to fetch comprehensive historical orders and reconstruct the buyer's loyalty score.

### D. Owner UPI Gateway Configurations Schema
- **Storage Key:** `aura_upi_settings`
- **TypeScript Interface (`UpiSettings`):**
  ```typescript
  export interface UpiSettings {
    enabled: boolean;
    upiId: string;      // Merchant Virtual Private Address (VPA)
    upiName: string;    // Merchant Legal Registered Name
  }
  ```

### E. Owner Authorization Cookie Session
- **Storage Key:** `aura_owner_logged_in`
- **Type:** `"true"` | `"false"`
- **Purpose:** Fast validation of current session login status without forcing re-entry of the owner passcode on layout refreshes.

---

## 4. Environment Variables Configuration
To guarantee robust operations in sandbox and production runtimes, the app utilizes server-side variables. These should never be hardcoded into source code:

- **`GEMINI_API_KEY`:** Required for the server-side AI Concierge endpoint (`/api/chat`). Kept hidden from public inspect networks by operating exclusively in backend routing space.
- **`NODE_ENV`:** Dictates server routing state (`"production"` vs `"development"`). Controls whether to run Vite-provided Hot Module Replacement middleware or static directory express asset distributions.
- **`PORT`:** Embedded default set to `3000` to feed the Reverse Proxy pipeline.
- **Firebase credentials:** Extracted client-side at runtime from `firebase-applet-config.json` generated dynamically during database provisioning. This protects local configurations and keeps keys decoupled from static source builds.
