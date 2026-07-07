# Implementation Plan

[Overview]
This plan upgrades the Aura & Co. boutique platform with 10 enhancements across three pillars: feature-wise polish (context-aware AI, owner fulfillment pipeline, layout stability), security hardening (JWT admin auth, Firestore admin claims, localized QR, rate limiting), and payment gateway evolution (UPI mobile intent, smart fallback stub, UTR integrity guard). The goal is to transform the current localStorage-gated, view-only owner panel into a secure, actionable fulfillment system while closing critical auth vulnerabilities identified in the existing codebase.

[Types]
Single sentence describing the type system changes.
Extend the `Order` interface with fulfillment lifecycle fields, add JWT session types, and introduce UTR audit metadata.

- **`src/types.ts` — Extended `Order`**:
  ```typescript
  export type FulfillmentStatus =
    | "pending_verification"  // UPI UTR not yet confirmed by owner
    | "processing"            // Verified, packing
    | "shipped"               // Handed to courier
    | "completed"             // Delivered
    | "cancelled"
    | "refunded";

  export interface OrderEvent {
    by: string;            // owner UID or "system"
    action: string;        // "shipped" | "verified" | "cancelled"
    at: string;            // ISO timestamp
  }

  export interface Order {
    id: string;
    userId: string;
    date: string;
    items: CartItem[];
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    currency: "USD" | "EUR" | "GBP" | "INR";
    shippingDetails: ShippingDetails;
    paymentMethod: "card" | "upi" | "gpay" | "phonepe";
    upiRefNo: string;                 // 12-digit UTR (existing field)
    utrStatus: "pending" | "verified" | "failed" | "audit_flagged";
    fulfillmentStatus: FulfillmentStatus;  // NEW — replaces loose `status`
    trackingNumber: string;           // existing
    courier?: string;                 // NEW
    eventLog: OrderEvent[];           // NEW append-only
    requiresAudit?: boolean;          // NEW — set by UTR uniqueness guard
  }
  ```
  Validation rules: `fulfillmentStatus` must be one of the union; `upiRefNo` must match `/^\d{12}$/` when `paymentMethod` is UPI; `eventLog` entries immutable after write.

- **`src/types.ts` — Chat Context Payload**:
  ```typescript
  export interface ConciergeContext {
    cartItems: CartItem[];
    currentView: string;   // e.g. "product:prod-3" | "catalog:Wellness"
  }
  ```

- **`server.ts` — Auth Types**:
  ```typescript
  interface OwnerSession { uid: string; exp: number; }
  // JWT signed with process.env.AURA_JWT_SECRET
  ```

[Files]
Single sentence describing file modifications.
New files for gateway stubs and plan docs; modifications to types, server, owner panel, cart sidebar, product card, firebase rules, and AI concierge.

- **New files:**
  - `src/utils/qr.ts` — Client-side QR generation wrapper using `react-qr-code` (replaces `api.qrserver.com` calls).
  - `src/components/OwnerOrdersTab.tsx` — New React component rendering the owner order table + fulfillment dropdown inside `OwnerPanelModal`.
  - `src/gateways/factory.ts` — Payment gateway factory stub (Stripe/Razorpay) for Smart Fallback (V2-ready, not wired to live SDK).
  - `src/gateways/proxy.ts` — Server-side proxy stub routing logic.
  - `src/gateways/gateways.ts` — Interface definitions for `StripeGateway`, `RazorpayGateway`.
  - `docs/8_IMPLEMENTATION_PLAN.md` — This plan.

- **Modified files:**
  - `src/types.ts` — Add `FulfillmentStatus`, `OrderEvent`, extend `Order`, add `ConciergeContext`.
  - `server.ts` — Add JWT signing on `/api/owner/verify-passcode`; add `/api/owner/verify` GET (cookie check); add `express-rate-limit` on passcode route; add UTR uniqueness check endpoint `/api/orders/check-utr`; inject cart context into `/api/gemini/chat`.
  - `src/components/OwnerPanelModal.tsx` — Add "Orders" tab; embed `OwnerOrdersTab`; remove `localStorage` auth reliance (use cookie session); use `src/utils/qr.ts` for live preview.
  - `src/components/CartSidebar.tsx` — Mobile intent CTA (`upi://` link) replacing QR on mobile UA; use `src/utils/qr.ts`.
  - `src/components/ProductCard.tsx` — Add `aspect-square` container + `animate-pulse` skeleton.
  - `src/components/AiConcierge.tsx` — Pass `cartItems` + `currentView` in fetch body.
  - `src/App.tsx` — Thread `cartItems`/`currentView` to `AiConcierge`; on mount call `/api/owner/verify` instead of reading localStorage.
  - `firestore.rules` — Allow order `update`/`write` when `request.auth.token.admin == true`; add `utrStatus`, `fulfillmentStatus`, `eventLog` to `isValidOrder`.
  - `firebase-blueprint.json` — Add new `Order` fields to schema.
  - `package.json` — Add `jsonwebtoken`, `express-rate-limit`, `react-qr-code`, `@types/jsonwebtoken`.

- **Deleted files:** None (external QR dependency removed via code, not file deletion).

- **Config updates:** `.env.example` — add `AURA_JWT_SECRET`, document `AURA_OWNER_PASSCODE` retention.

[Functions]
Single sentence describing function modifications.
New server endpoints and helpers; extended client handlers for fulfillment, context-aware chat, and mobile UPI.

- **New functions:**
  - `server.ts` → `POST /api/owner/verify-passcode` (modified to return JWT httpOnly cookie instead of `{success:true}`).
  - `server.ts` → `GET /api/owner/verify` — validates JWT cookie, returns `{authenticated: boolean}`.
  - `server.ts` → `POST /api/orders/check-utr` — queries Firestore for duplicate UTR in rolling 48h window; returns `{duplicate: boolean}`.
  - `server.ts` → `applyChatContext(systemInstruction, ctx: ConciergeContext)` — appends cart + view to Gemini system prompt.
  - `src/utils/qr.ts` → `generateUpiQrData(upiId, name, amountInr)` — returns encoded `upi://` string; component renders via `react-qr-code`.
  - `src/components/OwnerOrdersTab.tsx` → `OwnerOrdersTab({ orders, onUpdateFulfillment, onVerifyUtr })` — renders table + dropdowns.
  - `src/App.tsx` → `verifyOwnerSession()` — async cookie check on mount.

- **Modified functions:**
  - `server.ts` `/api/gemini/chat` — accept `context: ConciergeContext` in body; call `applyChatContext`.
  - `src/components/AiConcierge.tsx` `handleSendMessage` — include `context` from props in POST body.
  - `src/components/OwnerPanelModal.tsx` `handleLoginSubmit` — call `/api/owner/verify-passcode`, then rely on cookie; remove `onLogin()` localStorage set (or keep as fallback only).
  - `src/components/CartSidebar.tsx` — detect mobile UA; render `<a href={upiUri}>` button when mobile.
  - `src/App.tsx` `handlePlaceOrder` — call `/api/orders/check-utr` before `setDoc`; set `requiresAudit` if duplicate.

- **Removed functions:**
  - None deleted; `confirm()`-based owner logout retained as fallback.

[Classes]
Single sentence describing class modifications.
No class-based changes; React functional components and Express routers used throughout.

- **New classes:** None.
- **Modified classes:** None (all components are functional).
- **Removed classes:** None.

[Dependencies]
Single sentence describing dependency modifications.
Add JWT, rate-limit, and QR libraries; no removals.

- `jsonwebtoken` (^9) + `@types/jsonwebtoken` — admin session signing.
- `express-rate-limit` (^7) — brute-force protection on passcode endpoint.
- `react-qr-code` (^2) — client-side QR rendering (replaces `api.qrserver.com`).
- Firebase Admin SDK (`firebase-admin`) — **optional**, only if custom claims approach chosen over JWT cookie. Deferred to keep scope tight; plan uses JWT cookie as primary.

[Testing]
Single sentence describing testing approach.
Extend Vitest suites for security and currency; add new tests for UTR guard and fulfillment status.

- `tests/security.test.ts` — extend to assert JWT cookie returned (not `{success:true}` body only); assert rate-limit blocks after 5 attempts (HTTP 429); assert `/api/orders/check-utr` flags duplicates.
- `tests/fulfillment.test.ts` (new) — test `FulfillmentStatus` transitions validity; test `isValidOrder` rule shape.
- `src/tests/` — add component smoke test for `OwnerOrdersTab` dropdown render.
- Manual: login flow via cookie, owner order status flip in Firestore emulator, mobile intent CTA on devtools device mode.

[Implementation Order]
Single sentence describing the implementation sequence.
Security foundational changes first, then data schema, then UI, then payment evolution.

1. **Types & Schema** — Extend `src/types.ts` (`FulfillmentStatus`, `OrderEvent`, `Order`, `ConciergeContext`); update `firebase-blueprint.json`.
2. **Security Foundation** — Add `jsonwebtoken` + `express-rate-limit` to `server.ts`; rewrite `/api/owner/verify-passcode` to issue JWT cookie; add `/api/owner/verify` GET; apply rate limit.
3. **Firestore Rules** — Update `firestore.rules` to allow `admin` claim writes to `orders`/`products`; extend `isValidOrder`.
4. **UTR Integrity Guard** — Add `/api/orders/check-utr` endpoint; wire into `handlePlaceOrder` in `App.tsx`; set `requiresAudit`.
5. **Owner Fulfillment UI** — Create `OwnerOrdersTab.tsx`; add "Orders" tab to `OwnerPanelModal.tsx`; remove localStorage auth reliance.
6. **Context-Aware AI** — Modify `/api/gemini/chat` + `AiConcierge.tsx` + `App.tsx` to pass cart/view context.
7. **Localized QR** — Add `src/utils/qr.ts`; replace `api.qrserver.com` in `OwnerPanelModal.tsx` and `CartSidebar.tsx` with `react-qr-code`.
8. **Layout Stability** — Add `aspect-square` + `animate-pulse` skeletons in `ProductCard.tsx`.
9. **UPI Mobile Intent** — UA detection in `CartSidebar.tsx`; render `upi://` anchor CTA on mobile.
10. **Gateway Stubs (V2-ready)** — Create `src/gateways/{factory,proxy,gateways}.ts` as inert stubs documented for future wiring.
11. **Razorpay Live Integration (DONE)** — Added `razorpay` dep; `server.ts` now has `POST /api/payment/create-order` and `POST /api/payment/verify` using test keys `rzp_test_TAVhTBbGLmSCdH`. `CartSidebar.tsx` replaced the simulated card flow with real Razorpay Checkout (loads `checkout.razorpay.com/v1/checkout.js`, verifies HMAC signature server-side, then calls `onPlaceOrder`). `.env.example` documents the keys.
12. **Tests & Docs** — Extend `tests/security.test.ts`; add `tests/fulfillment.test.ts`; update `.env.example`.
