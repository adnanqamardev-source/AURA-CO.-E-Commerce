# Owner / Admin Dashboard — Comprehensive Product & UX Guide

> **Context:** This guide is written for **Aura & Co.**, a curated lifestyle boutique e-commerce platform (Home / Wellness / Work). It is a **single-instance, single-owner** storefront built on React 19 + Express + Firebase Firestore, with direct Indian UPI QR payments (zero MDR) as the primary settlement method.
>
> The current codebase ships a minimal owner panel (`OwnerPanelModal.tsx`) limited to **Catalog CRUD** and **UPI Gateway config**. There is **no owner-facing order management**, **no customer/user management**, and **no financial reporting**. Orders are written to Firestore `orders/{orderId}` but can only be viewed by the *customer* in `OrderHistoryModal.tsx`, and shipping status is purely simulated client-side.
>
> This document is the product/UX blueprint to close that gap.

---

## 1. Core Feature Checklist

### 1.1 User Management
Features the owner needs to view, govern, and secure customer accounts.

| # | Feature | Description | Priority |
| :-- | :-- | :-- | :-- |
| UM-1 | Customer Directory | Searchable, paginated table of all authenticated customers (email, phone, display name, sign-up date, auth provider). | Must-Have |
| UM-2 | Customer Detail Drawer | Side panel showing a single user's profile, order count, lifetime spend (loyalty points), and linked auth providers. | Must-Have |
| UM-3 | Role & Permission Matrix | Explicit role model: `guest`, `customer`, `owner`. Owner actions gated behind passcode + Firebase auth. | Must-Have |
| UM-4 | Account Status Controls | Ability to **disable / re-enable** a customer account (soft block) and force-sign-out. | Should-Have |
| UM-5 | Loyalty & Points Ledger | View and manually adjust loyalty point balances (currently `Math.floor(subtotal/10)*10`). | Should-Have |
| UM-6 | Customer Order History (Owner view) | Owner can open any customer's order list for support/fulfilment. | Must-Have |
| UM-7 | Data Export (GDPR/DPDP) | Export a customer's data as JSON/CSV; support account data deletion request. | Nice-to-Have |
| UM-8 | Audit Log | Record owner actions (login, catalog edits, order status changes, refunds) with timestamp + UID. | Should-Have |

### 1.2 Order Management
Features for viewing, processing, and managing user orders from the owner side.

| # | Feature | Description | Priority |
| :-- | :-- | :-- | :-- |
| OM-1 | Orders Table / List View | Filterable, sortable list of all orders (status, date, customer, total, payment method). | Must-Have |
| OM-2 | Order Detail View | Full line-items, shipping address, payment proof (UTR), status timeline. | Must-Have |
| OM-3 | Status Workflow Engine | Move orders through `Processing → Shipped → Delivered` (and `Cancelled` / `Refunded`). | Must-Have |
| OM-4 | Bulk Actions | Select multiple orders to bulk-mark as shipped / export. | Should-Have |
| OM-5 | Tracking Number Entry | Owner inputs carrier + tracking number; persisted to `orders/{id}.trackingNumber`. | Must-Have |
| OM-6 | UTR / Payment Verification | Owner reviews the 12-digit UPI UTR submitted at checkout; marks payment "Verified / Pending / Failed". | Must-Have |
| OM-7 | Cancellation & Refund | Cancel order, trigger refund workflow, record refund reference. | Must-Have |
| OM-8 | Search & Filter | By order ID, customer email, date range, status, payment method. | Must-Have |
| OM-9 | Order Notifications (Owner) | Toast/email when a new order lands or a UTR is submitted. | Nice-to-Have |
| OM-10 | Fulfilment Flags | Mark "packed", "handed to courier", "out for delivery" sub-states. | Should-Have |

### 1.3 Payment Gateway & Financial Management
Features for transactions, refunds, payouts, and reporting.

| # | Feature | Description | Priority |
| :-- | :-- | :-- | :-- |
| PG-1 | Transactions Ledger | Unified view of all payments (UPI/card), amount (INR + display currency), UTR, status. | Must-Have |
| PG-2 | Refund Management | Initiate, track, and record refunds (currently zero-fee UPI means owner repays manually from bank). | Must-Have |
| PG-3 | Payout / Settlement View | Since UPI settles **instantly to owner's bank**, show "Expected vs Received" reconciliation helper. | Should-Have |
| PG-4 | Financial Reporting | Daily / monthly Gross Merchandise Value (GMV), net sales, refunds, average order value. | Must-Have |
| PG-5 | UPI Gateway Config | Existing: toggle UPI, edit VPA ID, edit legal name, live QR preview. **Keep & extend.** | Must-Have |
| PG-6 | Payment Method Analytics | Breakdown of UPI vs Card vs GPay vs PhonePe usage. | Nice-to-Have |
| PG-7 | Tax / GST Summary | India-specific: summarize taxable amounts per period for GST filing. | Should-Have |
| PG-8 | Webhook / Bank Scraping (Future) | Out-of-scope V1 per PRD; documented as roadmap for auto-UTR confirmation. | Roadmap |

---

## 2. Order Tracking & Updating (Deep Dive)

### 2.1 Order Tracking Feature Checklist

| # | Tracking Feature | Notes |
| :-- | :-- | :-- |
| T-1 | Real-time Status Badge | Color-coded pill: `Processing` (blue), `Shipped` (amber), `Delivered` (emerald), `Cancelled` (red), `Refunded` (gray). |
| T-2 | Vertical Timeline | Reuse the `OrderHistoryModal` timeline component but make it **owner-editable**. |
| T-3 | Carrier & Tracking Number | Free-text carrier + `trackingNumber` field already exists in `Order` type — surface an edit control. |
| T-4 | Shipping Integration | For V1: manual entry. Roadmap: Shiprocket / Delhivery API to auto-fetch AWB + status. |
| T-5 | Customer Notifications | On status change, push an in-app toast (and future email/SMS) to the customer. |
| T-6 | Estimated Delivery Date | Computed field; owner can override. |
| T-7 | UTR Verification State | Separate state machine: `Pending UTR → Verified → Settled`. |
| T-8 | Event Log per Order | Append-only log of every status change with author + timestamp. |
| T-9 | CSV Export of Fulfilment | Export `orderId, customer, status, trackingNo, courier, date` for courier handoff. |

### 2.2 Order Status Update Workflow (Owner)

**Current schema** (`src/types.ts`):
```ts
status: "Processing" | "Shipped" | "Delivered";
trackingNumber: string;
```

**Recommended extended workflow:**

```
┌─────────────┐   owner verifies UTR   ┌──────────────┐
│  PENDING    │ ─────────────────────▶ │  PROCESSING  │
│  (UTR recv) │                        │  (Packing)   │
└─────────────┘                        └──────┬───────┘
                                            │ owner clicks "Mark Shipped"
                                            │ + enters courier & trackingNo
                                            ▼
                                     ┌──────────────┐
                                     │   SHIPPED    │
                                     │ (In-Transit) │
                                     └──────┬───────┘
                                            │ owner clicks "Mark Delivered"
                                            ▼
                                     ┌──────────────┐
                                     │  DELIVERED   │
                                     └──────────────┘

   At any stage:  ──▶ CANCELLED ──▶ REFUNDED (if payment was verified)
```

**Step-by-step owner procedure:**
1. **New order arrives** → appears in Orders table with status `Processing` (or `Pending UTR` if UPI).
2. **Verify payment** → open order, check the 12-digit UTR against bank receipt. Mark `UTR Verified`.
3. **Pack** → system auto-logs "Packing" event.
4. **Ship** → owner enters courier name + tracking number → status flips to `Shipped`, customer notified.
5. **Deliver** → owner (or future webhook) flips to `Delivered`.
6. **Exceptions** → `Cancel` (before ship) or `Refund` (after payment) with reason + reference logged.

**Firestore write pattern (owner update):**
```ts
await updateDoc(doc(db, "orders", orderId), {
  status: "Shipped",
  trackingNumber: "SR1234567890",
  courier: "Shiprocket",
  updatedAt: new Date().toISOString(),
  eventLog: arrayUnion({ by: ownerUid, action: "shipped", at: serverTimestamp() })
});
```
> Note: current `firestore.rules` only allow `update` if `request.auth.uid == resource.data.userId`. **This must be changed** to allow owner (admin claim) to update any order — see Best Practices §3.

---

## 3. Industry Best Practices

### 3.1 UX / UI Best Practices for an Owner Dashboard
- **Progressive disclosure:** Keep the dashboard calm. Primary tabs: `Overview`, `Orders`, `Customers`, `Payments`, `Catalog` (existing), `Settings`.
- **Consistent visual language:** Reuse the existing editorial theme — Warm Ivory `#faf9f6`, Onyx `#1a1a1a`, Indigo `#4f46e5` for secure/owner actions, Jade `#059669` for success. Use `font-mono` (JetBrains Mono) for IDs, UTRs, tracking numbers.
- **Data tables over cards** for orders/customers: dense, sortable, with sticky headers and row-hover.
- **Status pills:** never rely on color alone — pair with icon + label (e.g., `● Shipped`).
- **Confirm destructive actions:** cancellations, refunds, account disables use a confirmation dialog (existing pattern uses `confirm()` — upgrade to styled modal).
- **Optimistic UI + rollback:** update the row immediately, revert on Firestore error using existing `handleFirestoreError` utility.
- **Keyboard & a11y:** focus traps in modals (already in `OwnerPanelModal`), ARIA labels on table sort controls.
- **Empty states:** guide the owner ("No orders yet — share your store link").
- **Mobile responsive:** owner may use phone; bottom-tab nav, collapsible table columns.

### 3.2 Backend / Security Best Practices (Payments & Order Data)
- **Zero plain-text secrets:** `AURA_OWNER_PASSCODE` already env-driven — keep it. Never commit to repo (`.gitignore` already excludes `.env*`).
- **Role-based Firestore rules:** introduce a `request.auth.token.admin == true` custom claim for the owner. Update `firestore.rules`:
  ```js
  match /orders/{orderId} {
    allow update: if isSignedIn() && (
      resource.data.userId == request.auth.uid || request.auth.token.admin == true
    ) && isValidOrder(incoming());
  }
  ```
- **Input validation:** reuse the existing length/type guards from `/api/owner/verify-passcode` for any owner API.
- **UTR integrity:** enforce 12-digit numeric regex server-side before marking payment verified.
- **Audit trail:** every owner mutation appends to an `eventLog` (tamper-evident, append-only).
- **Least privilege:** customers can only `get`/`list` their own orders; owners get broad read, scoped write.
- **No card data on server:** existing Razorpay card frame is client-side tokenized — preserve that; never log PAN/CVC.
- **Rate limiting:** throttle `/api/owner/verify-passcode` and future refund endpoints to prevent brute force.
- **Session timeout:** `aura_owner_logged_in` is persistent — add idle expiry (e.g., 30 min).

### 3.3 Operational Best Practices (Fulfilment & Tracking)
- **Single source of truth:** Firestore `orders` collection is canonical; localStorage is cache only.
- **UTR reconciliation daily:** owner cross-checks submitted UTRs against bank statement (per PRD, automated scraping is V2).
- **SLA definitions:** Processing ≤ 24h, Shipped ≤ 48h, Delivery estimate shown to customer.
- **Communication cadence:** notify customer at every status transition (reduces "where is my order?" tickets).
- **Cancellation window:** only before `Shipped`; after that require refund + reason.
- **Inventory sync:** when an order is `Delivered`, optionally decrement stock (future — current catalog has no stock field).
- **Backup:** Firestore auto-backups; export monthly for accounting.
- **GST readiness:** tag each order with `currency`, `total` (INR equivalent) for filings.

---

## 4. Baseline "V1.0 Current Feature List" (Example)

Use this as a comparison yardstick against your own plans.

### Aura & Co. — Owner Dashboard V1.0 Feature List

| Module | Feature | Status | Notes |
| :-- | :-- | :-- | :-- |
| **Authentication** | Passcode gate (`admin`/`admin123`) | ✅ Shipped | Env-overridable via `AURA_OWNER_PASSCODE` |
| **Authentication** | Persistent session (`aura_owner_logged_in`) | ✅ Shipped | No idle timeout (known gap) |
| **Catalog** | View products | ✅ Shipped | Reads from `localStorage` + Firestore |
| **Catalog** | Add product | ✅ Shipped | Custom form in `OwnerPanelModal` |
| **Catalog** | Edit product | ✅ Shipped | Inline edit form |
| **Catalog** | Delete product | ✅ Shipped | With confirm |
| **Catalog** | Reset to defaults | ✅ Shipped | Wipes custom edits |
| **UPI Gateway** | Enable/disable UPI | ✅ Shipped | Toggle in panel |
| **UPI Gateway** | Edit VPA ID | ✅ Shipped | Free-text |
| **UPI Gateway** | Edit legal name | ✅ Shipped | Free-text |
| **UPI Gateway** | Live QR preview | ✅ Shipped | `api.qrserver.com` |
| **Orders (Owner)** | View all orders | ❌ Missing | Only customer sees own orders |
| **Orders (Owner)** | Update status | ❌ Missing | Status hardcoded `Processing` at creation |
| **Orders (Owner)** | Enter tracking number | ❌ Missing | Field exists but no owner UI |
| **Orders (Owner)** | Verify UTR | ❌ Missing | UTR captured but not reviewed by owner |
| **Orders (Owner)** | Cancel / Refund | ❌ Missing | Not implemented |
| **Customers (Owner)** | Customer directory | ❌ Missing | No user management |
| **Customers (Owner)** | Account disable | ❌ Missing | — |
| **Customers (Owner)** | Loyalty adjust | ❌ Missing | Read-only points calc |
| **Payments** | Transactions ledger | ❌ Missing | No financial view |
| **Payments** | Refund record | ❌ Missing | — |
| **Payments** | GMV / Sales report | ❌ Missing | — |
| **Payments** | GST summary | ❌ Missing | — |
| **Audit** | Owner action log | ❌ Missing | No audit trail |
| **Notifications** | New-order alert (owner) | ❌ Missing | — |
| **Notifications** | Status-change (customer) | ⚠️ Partial | Customer timeline is simulated only |

### Legend
- ✅ Shipped & working
- ⚠️ Partial / simulated
- ❌ Missing (recommended for V1.1+)

---

## Appendix: Recommended Firestore Schema Extensions

```ts
// Extend existing Order type
interface Order {
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
  upiRefNo: string;            // 12-digit UTR
  utrStatus: "pending" | "verified" | "failed";
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled" | "Refunded";
  trackingNumber: string;
  courier?: string;
  eventLog: { by: string; action: string; at: string }[];
}
```

> This guide is intentionally framework-agnostic in prose but references the actual Aura & Co. files (`OwnerPanelModal.tsx`, `OrderHistoryModal.tsx`, `firestore.rules`, `src/types.ts`) so it can be directly translated into implementation tickets.