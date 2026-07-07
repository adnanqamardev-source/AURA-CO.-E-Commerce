# Feature Ticket List

This list serves as a direct development backlog for the Aura & Co. Boutique application, breaking down the entire product requirements into small, actionable, and atomic tasks suitable for prompt execution.

---

## Ticket #1: Elegant Catalog Showcase & Categorization
- **Feature Name:** Interactive Showroom UI
- **Priority:** **MUST-HAVE**
- **Description:** Build the main desktop-first showroom layout showing the beautiful product catalog with dynamic filter tabs (All, Home, Wellness, Work).
- **Dependencies:** None.
- **Acceptance Criteria:**
  - Standard grid displaying 8 default boutique items.
  - Clicking filter tabs filters items immediately without screen refreshes.
  - Hovering on a card displays clean visual effects and an "Add to Bag" action trigger.

---

## Ticket #2: Multi-Currency Exchange Engine
- **Feature Name:** Multi-Currency Translation
- **Priority:** **MUST-HAVE**
- **Description:** Implement a conversion module allowing customers to toggle prices between USD, EUR, and GBP instantly with accurate formatting. INR is used internally for UPI payment conversion.
- **Dependencies:** Ticket #1.
- **Acceptance Criteria:**
  - Header displays a currency selector dropdown.
  - Selecting a currency recalculates and updates all prices across the catalog and cart sidebar dynamically.
  - Correct symbols ($, €, £) are printed alongside values.

---

## Ticket #3: Client Bag Storage (Cart)
- **Feature Name:** Cart Drawer State
- **Priority:** **MUST-HAVE**
- **Description:** Design a sliding cart sidebar displaying current items, subtotal, shipping configurations, and calculated customer loyalty points.
- **Dependencies:** Ticket #1.
- **Acceptance Criteria:**
  - User can add/remove items and increase/decrease quantities.
  - Subtotals recalculate in real-time.
  - Persists items in `localStorage` key `aura_cart` so refreshing does not wipe active checkouts.

---

## Ticket #4: Secure Owner Passcode Lock Wall
- **Feature Name:** Gatekeeper Auth Shield
- **Priority:** **MUST-HAVE**
- **Description:** Create an authorization gate on the Owner Panel Modal requesting a username and passcode before revealing inventory tools.
- **Dependencies:** None.
- **Acceptance Criteria:**
  - Clicking the Shield icon in the navigation bar opens the Owner login gate if unauthenticated.
  - Submitting `admin` and `admin123` unlocks access, flips the session state to `true`, and saves it in `localStorage` under `aura_owner_logged_in`.
  - Wrong passcodes display a red visual warning banner.

---

## Ticket #5: Catalog CRUD Administration Panel
- **Feature Name:** Catalog Inventory Control
- **Priority:** **MUST-HAVE**
- **Description:** Build the catalog administration dashboard where authorized boutique owners can add new items, modify existing listings, or delete obsolete items.
- **Dependencies:** Ticket #4.
- **Acceptance Criteria:**
  - Form inputs support creating new custom products with custom names, category options, prices, and image locations.
  - Clicking "Edit" populates and opens the modify editor block.
  - "Delete" removes the selected listing.
  - "Reset Inventory" button lets the owner wipe custom edits and restore the 8 default items.

---

## Ticket #6: Indian UPI QR Payment System
- **Feature Name:** Direct UPI Payment Checkout
- **Priority:** **MUST-HAVE**
- **Description:** Build an integrated UPI QR payment option inside the checkout drawer, translating the base currency total to INR and displaying a secure dynamic QR Code.
- **Dependencies:** Ticket #2, Ticket #3, Ticket #4.
- **Acceptance Criteria:**
  - If UPI is enabled, checkout shows **💳 Card Payment** and **🇮🇳 UPI QR Code** buttons.
  - Selecting UPI translates totals to INR (using dynamic exchange rates: 1 USD = 83.5 INR) and fetches a trusted QR image encoded with NPCI standard parameters.
  - Shows clear display name and recipient UPI ID handles.

---

## Ticket #7: NPCI Transaction Verification (UTR) Guard
- **Feature Name:** UTR Payment Verification Input
- **Priority:** **MUST-HAVE**
- **Description:** Force UPI buyers to provide the 12-digit transaction reference number (UTR) from their UPI app receipt to successfully place an order.
- **Dependencies:** Ticket #6.
- **Acceptance Criteria:**
  - A text input field accepts the UTR reference number.
  - Validates that the input is exactly 12 numeric digits before letting the order complete.
  - Successfully submitted UTRs are saved directly inside the Order Log history.

---

## Ticket #8: AI Companion Chat Concierge
- **Feature Name:** Intelligent Shopping Assistant
- **Priority:** **SHOULD-HAVE**
- **Description:** Implement a floating AI companion chat drawer proxying queries to the server-side Gemini API.
- **Dependencies:** None.
- **Acceptance Criteria:**
  - Floating action bubble opens a conversational workspace.
  - Posts user queries to `/api/gemini/chat` and streams back answers safely.
  - Fallbacks gracefully to offline assistance if the API credentials are unset.
  - Supports action tags for quick-add and view-product functionality.

---

## Ticket #9: Firebase Multi-Protocol Customer Auth
- **Feature Name:** Customer Accounts & Profiles
- **Priority:** **MUST-HAVE**
- **Description:** Integrate Firebase Authentication allowing customers to sign up and login via email, Google Sign-In, or secure Phone/SMS Verification.
- **Dependencies:** None.
- **Acceptance Criteria:**
  - User profile modal supports tabs for email credentials, Google Sign-in, and Phone Auth.
  - Phone Auth uses E.164 phone formats and supports invisible reCAPTCHA code verification.
  - Correctly verifies and confirms 6-digit SMS OTP code, signing in the profile.

---

## Ticket #10: Firestore Cloud State Synchronizer
- **Feature Name:** Firestore Database Synchronization
- **Priority:** **MUST-HAVE**
- **Description:** Enable full-duplex synchronization of shopping carts and purchase history records between active frontend state and Firestore collections.
- **Dependencies:** Ticket #9.
- **Acceptance Criteria:**
  - Authenticated sessions dynamically save and sync active cart items to `carts/{userId}` in Firestore with debouncing.
  - Fetch user cart and historical orders from Firestore collections `orders` instantly upon user login.
  - Keep localStorage as an offline caching backup.
  - Fallback cleanly to guest state upon user logout.

---