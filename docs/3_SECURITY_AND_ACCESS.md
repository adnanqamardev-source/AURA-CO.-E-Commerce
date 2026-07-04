# Security and Access Document

## 1. Authentication Method
To maintain a high-contrast, zero-maintenance design suitable for small-scale boutique management, Aura & Co. deploys a secure **Gatekeeper Pattern** for administrative access:

- **Passcode Authentication:** The Store Owner Portal is locked behind an authorization wall. To gain edit access, a user must submit the correct credentials.
- **Testing Credentials:**
  - **Username:** `admin`
  - **Key/Passcode:** `admin123`
- **Session Lifecycles:** When successfully authenticated, the session state (`isOwnerLoggedIn`) is flipped to `true` and persisted in the client's secure browser memory (`localStorage` key `aura_owner_logged_in`). This removes the friction of logging back in during continuous active catalog tuning sessions.

---

## 2. User Roles & Permissions Matrix
The system enforces strict structural separation between standard consumer interfaces and merchant configurations:

| UI/UX Context | Guest / Customer Role | Store Owner (Authenticated) Role |
| :--- | :--- | :--- |
| **Boutique Showroom** | View, browse products, search, filter by category. | View, browse products, search, filter. |
| **Currency Switching** | Toggle base display between USD, EUR, GBP, and INR. | Toggle base display. |
| **Cart & Ordering** | Add to bag, apply coupons, submit address, pay. | Add to bag, apply coupons, submit address, pay. |
| **UPI QR Checkout** | Scan automatically adjusted QR code and input UTR. | Scan QR and check layout response. |
| **Order Logs** | View personal order logs and total loyalty scores. | View personal logs. |
| **Catalog CRUD Manager**| **RESTRICTED.** Cannot see administrative forms or edits. | **ALLOWED.** Create products, edit prices, delete items. |
| **Reset Standard Catalog**| **RESTRICTED.** Cannot wipe inventory data. | **ALLOWED.** Hard reset to original 8 standard products. |
| **UPI Gateway Admin** | **RESTRICTED.** Cannot view settings panel. | **ALLOWED.** Toggle payment route, edit VPA ID / Display name. |

---

## 3. Data Integrity & Validation Rules
To prevent corrupt data entries or application-wide runtime failures, inputs are sanitised at key transaction boundaries:

### A. UPI Transaction Ref (UTR / Ref No.) Validation
- **NPCI Specification:** UPI UTR transaction reference numbers must consist of exactly **12 numeric digits**.
- **Regex Guard:** `/^\d{12}$/`
- **Enforcement:** If a buyer selects UPI, they cannot submit or place the order if the UTR input is empty or deviates from the 12-digit numeric constraint.

### B. Catalog Product Form Safeguards
- **Name:** Minimum 3 characters; maximum 50 characters.
- **Price:** Strictly positive integers/numbers; minimum $1 USD base price.
- **Image URL:** Must contain a valid address pattern.

### C. Merchant VPA Identifier Validation
- **UPI ID Handle Check:** Must conform to VPA syntax (`merchant@bank` style handles, e.g. `@okaxis`, `@ybl`, `@upi`).

---

## 4. Comprehensive Error Playbook

| Failure Point | Cause of Error | UI Response | Recovery Action |
| :--- | :--- | :--- | :--- |
| **Owner Gateway Log** | Incorrect passcode/username entered. | Displays red error banner: *"Invalid credentials. Please use admin and admin123 to verify."* | Clears password field, refocuses input for re-entry. |
| **UPI UTR Checkout** | User left Ref No. input empty. | Displays: *"Please enter the 12-digit UPI Ref/UTR No. to confirm your payment."* | User inputs transaction number from banking receipt. |
| **UPI UTR Format** | Entered digits are less than or more than 12, or contain alphabets. | Displays: *"NPCI UPI Transaction Reference (UTR) must be exactly 12 numeric digits."* | Client-side input filter strips any non-numeric keyboard taps automatically. |
| **AI Companion Chat** | Gemini API key is missing from environment. | Server logs error. Front-end chat bubble gracefully defaults to high-quality offline boutique response. | System checks `.env` file on backend container to configure `GEMINI_API_KEY`. |
| **Missing Image URL** | Curated catalog item uses broken or missing link. | Browser fallback displays an elegant visual geometric vector pattern with category title. | Owner edits item in catalog to replace image URL with valid location. |

---

## 5. Edge Cases Handled
1. **Broken Local Storage Memory:** If local memory is corrupted or manually cleared by browser settings, React states automatically fall back gracefully to the original 8 curated boutique products, default UPI VPA settings, and empty checkout bags without crashing the screen.
2. **Offline Mode Resilience:** If the customer loses internet connectivity during QR checkout, the static QR code (which generates natively using URI payloads) remains functional, allowing physical NPCI payments to complete offline before internet restoration.
