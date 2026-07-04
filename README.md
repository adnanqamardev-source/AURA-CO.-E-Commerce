# AURA & CO. — Minimalist E‑Commerce (Aesthetic Lifestyle Shop)

AURA & CO. is a curated, minimalist e‑commerce storefront showcasing premium lifestyle products — handcrafted homewares, refined desk accessories, and wellness essentials. It pairs a React + Vite frontend with a small Express server and Firebase for authentication, cart, and orders — designed as a boutique demo with an interactive AI shopping concierge.

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
  - esbuild / tsx / vitest for dev tooling & testing

## What you’ll find in this repo
Top-level files and folders:
- .env.example — example environment variables
- package.json, package-lock.json — scripts & dependencies
- server.ts — Express server + API routes (development Vite middleware + production static serving)
- vite.config.ts — Vite config
- vercel.json — Vercel settings
- firebase-applet-config.json, firebase-blueprint.json, firestore.rules — Firebase configuration & rules
- index.html — SPA entry
- src/ — frontend source (React components, styles, product catalog)
- assets/ — images / static assets
- docs/ — project docs
- tests/ — vitest tests
- tsconfig.json

## Project structure (annotated)
src/
  App.tsx                — main SPA shell (catalog, cart, modals, AI concierge)
  main.tsx               — client entry
  index.css              — global styles / Tailwind
  products.ts            — canonical product catalog (shared with server)
  types.ts               — shared TypeScript types (CartItem, Order, etc.)
  components/            — UI components and modal overlays
    AiConcierge.tsx
    CartSidebar.tsx
    Navbar.tsx
    ProductCard.tsx
    ProductDetailModal.tsx
    OrderHistoryModal.tsx
    OwnerPanelModal.tsx
    UserAuthModal.tsx
  utils/                 — firebase helpers, currency helpers, etc.

How it fits together:
- The frontend (Vite + React) renders the product catalog and UI. App.tsx manages cart state (localStorage + Firestore sync), orders, owner panel, and opens modals.
- server.ts exposes a small API used by the AI assistant (/api/gemini/chat) and an owner passcode check endpoint (/api/owner/verify-passcode). The server runs with Vite middleware in development and serves static assets in production.
- products.ts contains the single source of truth product list which is imported on both client and server sides for consistent behavior.

## Quickstart — run locally
1. Clone and install:
   ```bash
   git clone https://github.com/adnanqamardev-source/AURA-CO.-E-Commerce.git
   cd AURA-CO.-E-Commerce
   npm install
   ```
2. Copy and edit environment variables:
   - Copy `.env.example` to `.env` and fill in keys. See the **Environment variables** section below.
   - Firebase config is provided in `firebase-applet-config.json`; ensure your Firebase project credentials are configured per your deployment approach.
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
Store secrets in `.env` (do not commit). The repo includes `.env.example` as a starting point. Notable variables used by the project:
- GEMINI_API_KEY — API key for Google Gemini (used by the `/api/gemini/chat` route)
- AURA_OWNER_USERNAME — owner panel username (defaults to `admin` if unset)
- AURA_OWNER_PASSCODE — owner panel passcode (defaults to `admin123` if unset)
- Standard Firebase environment values (if you prefer env-based config instead of the JSON file)

The server checks for GEMINI_API_KEY and will return a descriptive error if missing.

## Firebase
- Auth: customer sign in/out for cart & orders
- Firestore collections used: `carts`, `orders`
- The client syncs cart data to Firestore for signed-in users; localStorage is the fallback when not signed in.
- There are Firebase rules in `firestore.rules` and a `firebase-applet-config.json` file in the repo.

## API endpoints (server)
- POST /api/gemini/chat
  - Body: { message: string, history?: Array }
  - Forwards the user message to the configured Gemini model using system instructions that include the product catalog.
- POST /api/owner/verify-passcode
  - Body: { username: string, passcode: string }
  - Verifies owner credentials against environment values.

## Development notes & security considerations
- server.ts embeds the product catalog into the AI system instruction to ensure the AI only recommends products from the catalog.
- The owner passcode endpoint includes basic input validation and length checks. For production, prefer a stronger auth method and avoid plain passcodes in env vars.
- Never commit `.env` or secrets. Use your hosting provider's secrets management (Vercel, Netlify, etc.) for GEMINI_API_KEY and Firebase credentials.
- The product catalog (src/products.ts) is mutable via the Owner Panel (OwnerPanelModal) which updates local state and persists to localStorage. Consider a backend-managed catalog for production scenarios.

## Deployment
- The repo includes a `vercel.json` — this project can be deployed to Vercel. Ensure secrets (GEMINI_API_KEY, Firebase credentials, owner passcode) are added via the Vercel dashboard.
- For self-hosted deploys: build (`npm run build`) and run `node dist/server.cjs`. Set NODE_ENV=production and configure environment secrets.

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

---
If you want, I can place this README into the repository as README.md so it's visible on the project home page.
