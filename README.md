# AURA & CO. — Minimalist E‑Commerce (Aesthetic Lifestyle Shop)

AURA & CO. is a curated, minimalist e‑commerce storefront showcasing premium lifestyle products — handcrafted homewares, refined desk accessories, and wellness essentials. It pairs a React + Vite frontend with an Express server and Firebase for authentication, cart, and orders — designed as a boutique demo with an interactive AI shopping concierge.

## Stack
- Language(s): TypeScript (frontend + server)
- Framework / runtime:
  - Frontend: Vite + React (TSX)
  - Server: Express (Node) used in development with Vite middleware; bundled with esbuild for production
- Notable libraries / services:
  - Firebase (Auth, Firestore)
  - Google Gemini (via @google/genai) for the "Aura Guide" AI concierge
  - Tailwind CSS (via tailwindcss + @tailwindcss/vite)
  - lucide-react (icons)
  - motion (animations)
  - esbuild / tsx / vitest for dev tooling & testing

## What you'll find in this repo
Top-level files and folders:
- `.env` — environment variables (create from .env.example)
- `package.json`, `package-lock.json` — scripts & dependencies
- `server.ts` — Express server + API routes (development Vite middleware + production static serving)
- `vite.config.ts` — Vite config
- `vercel.json` — Vercel settings
- `firebase-applet-config.json`, `firebase-blueprint.json`, `firestore.rules` — Firebase configuration & rules
- `index.html` — SPA entry
- `src/` — frontend source (React components, styles, product catalog)
- `api/` — Vercel serverless function entry point
- `tests/` — vitest tests
- `tsconfig.json`

## Project structure (annotated)
src/
  App.tsx                — main SPA shell (catalog, cart, modals, AI concierge)
  main.tsx               — client entry
  index.css              — global styles / Tailwind
  products.ts            — canonical product catalog (shared with server)
  types.ts               — shared TypeScript types (CartItem, Order, etc.)
  types/                 — extended type definitions
  │   └── payment.ts     — PaymentRequest, GatewayType and IPaymentGateway types
  components/            — UI components and modal overlays
  │   AiConcierge.tsx           — AI chat floating drawer and logic
  │   CartSidebar.tsx           — Shopping bag, shipping details, UPI checkout
  │   Navbar.tsx                — Sticky top bar with navigation, currency, admin portal triggers
  │   ProductCard.tsx           — Individual product card UI with options
  │   ProductDetailModal.tsx    — Detailed product view modal
  │   OrderHistoryModal.tsx     — Past purchase records and loyalty system
  │   OwnerPanelModal.tsx       — Secured Lock screen + Store Admin Catalog & UPI gate controllers
  │   UserAuthModal.tsx         — Firebase Multi-Protocol Authentication (Email, Google, Phone SMS)
  controllers/           — Express controllers/routers
  │   └── paymentController.ts  — Checkout API entry point
  services/              — Service layer
  │   └── payment/       — Payment gateway implementations
  │       ├── factory.ts    — Gateway Factory
  │       ├── gateways.ts   — Stripe, Razorpay, UPI gateway implementations
  │       ├── proxy.ts      — PaymentGatewayProxy with exponential backoff
  │       └── service.ts    — PaymentService (Singleton controller)
  utils/                 — firebase helpers, currency helpers, etc.
    currency.ts          — Currency conversions (USD, EUR, GBP)
    firebase.ts          — Firebase App, Firestore, and Auth initialization

How it fits together:
- The frontend (Vite + React) renders the product catalog and UI. App.tsx manages cart state (localStorage + Firestore sync), orders, owner panel, and opens modals.
- server.ts exposes a small API used by the AI assistant (/api/gemini/chat) and an owner passcode check endpoint (/api/owner/verify-passcode). The server runs with Vite middleware in development and serves static assets in production.
- On Vercel, the api/index.ts exports the app for serverless function handling.
- products.ts contains the single source of truth product list which is imported on both client and server sides for consistent behavior.

## Quickstart — run locally
1. Clone and install:
   ```bash
   git clone https://github.com/adnanqamardev-source/AURA-CO.-E-Commerce.git
   cd AURA-CO.-E-Commerce
   npm install
   ```

2. Set up environment variables:
   - Create `.env` file with your secrets. See the **Environment variables** section below.
   - Firebase config is provided in `firebase-applet-config.json`; ensure your Firebase project credentials are configured.

3. Run in development (Vite HMR + Express middleware):
   ```bash
   npm run dev
   ```
   The Express server listens on port 3000 by default (process.env.PORT can override). Vite dev middleware serves the frontend with HMR.

4. Build for production:
   ```bash
   npm run build
   npm run start
   ```
   - `npm run build` runs `vite build` and bundles `server.ts` to `dist/server.cjs`.
   - `npm run start` runs `node dist/server.cjs` to serve production assets.

5. Tests & lint:
   ```bash
   npm run test   # vitest
   npm run lint   # TypeScript type-check (tsc --noEmit)
   ```

## Environment variables
Store secrets in `.env` (do not commit). Required variables:
- `GEMINI_API_KEY` — API key for Google Gemini (used by the `/api/gemini/chat` route)
- `AURA_OWNER_USERNAME` — owner panel username (defaults to `admin` if unset)
- `AURA_OWNER_PASSCODE` — owner panel passcode (defaults to `admin123` if unset)

Example `.env` file:
```env
GEMINI_API_KEY=your_gemini_api_key_here
AURA_OWNER_USERNAME=admin
AURA_OWNER_PASSCODE=admin123
```

## Firebase
- Auth: customer sign in/out for cart & orders (Email/Password, Google, Phone SMS with invisible reCAPTCHA)
- Firestore collections used: `carts`, `orders`, `products`
- The client syncs cart data to Firestore for signed-in users; localStorage is the fallback when not signed in.
- There are Firebase rules in `firestore.rules` and a `firebase-applet-config.json` file in the repo.

## API endpoints (server)
- POST `/api/gemini/chat`
  - Body: `{ message: string, history?: Array }`
  - Forwards the user message to the configured Gemini model using system instructions that include the product catalog.
- POST `/api/owner/verify-passcode`
  - Body: `{ username: string, passcode: string }`
  - Verifies owner credentials against environment values.
- POST `/api/payment/process`
  - Payment gateway processing endpoint (extensible for future payment integrations)

## Development notes & security considerations
- server.ts embeds the product catalog into the AI system instruction to ensure the AI only recommends products from the catalog.
- The owner passcode endpoint includes basic input validation and length checks. For production, prefer a stronger auth method and avoid plain passcodes in env vars.
- Never commit `.env` or secrets. Use your hosting provider's secrets management (Vercel, Netlify, etc.) for GEMINI_API_KEY and Firebase credentials.
- The product catalog (src/products.ts) is mutable via the Owner Panel (OwnerPanelModal) which updates local state and persists to localStorage. Consider a backend-managed catalog for production scenarios.

## Deployment
- The repo includes a `vercel.json` — this project can be deployed to Vercel. Ensure secrets (GEMINI_API_KEY, Firebase credentials, owner passcode) are added via the Vercel dashboard.
- For self-hosted deploys: build (`npm run build`) and run `node dist/server.cjs`. Set NODE_ENV=production and configure environment secrets.
- The application supports multi-currency display (USD, EUR, GBP) with INR conversion for UPI payments.

## Contributing
- Open an issue or a pull request. Suggested workflow:
  1. Fork the repo and create a branch (feature/bugfix).
  2. Make changes, run lint/tests.
  3. Submit a PR with a clear description and screenshots if the UI changed.

## Known gaps / suggestions
- No LICENSE file is present in the repository root. Add a license if you intend to make the project open source.
- Consider moving the product catalog to Firestore or a headless CMS for collaborative editing and persistence across environments.
- Add CI (GitHub Actions) for automated linting, type checks, and tests.

## Acknowledgements
- Built with React, Vite, Tailwind, Firebase, and Google Gemini.
- Icons by lucide-react.