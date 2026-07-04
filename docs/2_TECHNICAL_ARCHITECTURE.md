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
- **Data Persistence Strategy:** Local state synchronized React-side with immediate automatic updates to browser `localStorage` for high performance, zero latency, and local persistence of order history, customized catalog items, and gateway configurations.

---

## 2. File & Folder Structure Map
The project is structurally divided into modular directories separating layout design, business logic, static data, and backend operations:

```text
├── docs/                             # Project Architecture Documentation
│   ├── 1_PRD.md                      # Product Requirements Document
│   ├── 2_TECHNICAL_ARCHITECTURE.md   # System Architecture blueprint
│   ├── 3_SECURITY_AND_ACCESS.md      # Access Control & Error Playbooks
│   ├── 4_FRONTEND_SPECIFICATION.md   # Design Tokens & UI Specs
│   └── 5_FEATURE_TICKET_LIST.md      # Step-by-step Development Tickets
├── src/
│   ├── components/                   # Modular React UI Components
│   │   ├── AiConcierge.tsx           # AI chat floating drawer and logic
│   │   ├── CartSidebar.tsx           # Shopping bag, shipping details, UPI checkout
│   │   ├── Navbar.tsx                # Sticky top bar with navigation, currency, admin portal triggers
│   │   ├── OrderHistoryModal.tsx     # Past purchase records and loyalty system
│   │   └── OwnerPanelModal.tsx       # Secured Lock screen + Store Admin Catalog & UPI gate controllers
│   ├── utils/
│   │   └── currency.ts               # Currency conversions, rates, symbol formatting
│   ├── App.tsx                       # Main layout coordinator and central state machine
│   ├── index.css                     # Tailwind v4 import, custom font setups & theme variables
│   ├── main.tsx                      # Vite React browser entrypoint
│   ├── products.ts                   # Standard curated product database and categories
│   └── types.ts                      # Shared TypeScript interface definitions
├── server.ts                         # Full-stack Express server handling API endpoints and Vite development middleware
├── package.json                      # NPM configuration, dependencies and build scripts
├── vite.config.ts                    # Vite build configuration with React plugin
├── tsconfig.json                     # TypeScript compiler configurations
├── .env.example                      # Boilerplate environment variable documenter
└── metadata.json                     # System framework permissions and capabilities manifest
```

---

## 3. Local Databases & State Schema
To guarantee instant response and reliable state tracking across refreshing browser sessions, all variables are formatted as structured JSON schemas saved in client-side storage keys:

### A. Catalog Products Database Schema
- **Storage Key:** `aura_products`
- **TypeScript Interface (`Product`):**
  ```typescript
  export interface Product {
    id: string;
    name: string;
    price: number;       // Base Price in USD
    category: "Home" | "Wellness" | "Work";
    image: string;       // Public URL address
    description: string; // Exquisite description slogan
  }
  ```

### B. Orders & Loyalty Log Schema
- **Storage Key:** `aura_orders`
- **TypeScript Interface (`Order`):**
  ```typescript
  export interface Order {
    id: string;
    items: {
      product: Product;
      quantity: number;
    }[];
    subtotal: number;
    discount: number;
    total: number;
    currency: string;
    shipping: {
      name: string;
      email: string;
      address: string;
      city: string;
      postalCode: string;
      phone: string;
    };
    paymentMethod: "card" | "upi";
    upiRefNo?: string;  // Present only if checked out via UPI QR Code
    date: string;       // ISO 8601 Timestamp
  }
  ```

### C. Owner UPI Gateway Configurations Schema
- **Storage Key:** `aura_upi_settings`
- **TypeScript Interface (`UpiSettings`):**
  ```typescript
  export interface UpiSettings {
    enabled: boolean;
    upiId: string;      // Merchant Virtual Private Address (VPA)
    upiName: string;    // Merchant Legal Registered Name
  }
  ```

### D. Owner Authorization Cookie Session
- **Storage Key:** `aura_owner_logged_in`
- **Type:** `"true"` | `"false"`
- **Purpose:** Fast validation of current session login status without forcing re-entry of the owner password on standard layout refreshes.

---

## 4. Environment Variables Configuration
To guarantee robust operations in sandbox and production runtimes, the app utilizes server-side variables. These should never be hardcoded into source code:

- **`GEMINI_API_KEY`:** Required for the server-side AI Concierge endpoint (`/api/chat`). Kept hidden from public inspect networks by operating exclusively in backend routing space.
- **`NODE_ENV`:** Dictates server routing state (`"production"` vs `"development"`). Controls whether to run Vite-provided Hot Module Replacement middleware or static directory express asset distributions.
- **`PORT`:** Embedded default set to `3000` to feed the Reverse Proxy pipeline.
