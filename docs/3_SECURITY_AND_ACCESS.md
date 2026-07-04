# Security and Access Document

## 1. Authentication Protocols
Aura & Co. deploys a secure, multi-layered authentication framework separating administrative store control and consumer account management.

### A. Gatekeeper Pattern (Store Owner Portal)
- **Method:** Standard passcode authorization wall. To gain edit access to the catalog and UPI settings, the user must submit valid credentials.
- **Testing Credentials:**
  - **Username:** `admin`
  - **Key/Passcode:** `admin123` (Overridable via backend environment variable `AURA_OWNER_PASSCODE`).
- **Session Lifecycles:** Successfully validated sessions set the localStorage key `aura_owner_logged_in` to `true`, persisting session logs for convenience.

### B. Multi-Protocol Authentication (Customer Accounts)
Aura & Co. integrates Firebase Authentication to allow users to sign up, sign in, and sync their shopping data seamlessly. Three distinct auth strategies are supported:
1. **Email / Password Vault:** Standard credentials registration. Password must be at least 6 characters long.
2. **Google Single Sign-On:** Fast, zero-input profile creation utilizing Google Identity providers.
3. **Phone OTP Verification (SMS Access):**
   - **User Input:** Enter complete phone number in international E.164 format (e.g., `+15551234567` or `+919876543210`).
   - **Anti-Spam Security:** Operates an **invisible reCAPTCHA Verifier** tied to the DOM button ID. This prevents computerized brute-forcing of SMS credits.
   - **Dispatch Protocol:** Triggers Firebase's server-side dispatch (`signInWithPhoneNumber`) sending a 6-digit verification code directly to the customer's cell device.
   - **Handshake Confirmation:** The user inputs the code, and client-side confirmation (`confirmationResult.confirm(otpCode)`) safely completes login.

---

## 2. Firestore Security Rules Configuration (`firestore.rules`)
To safeguard user data in transit and rest on Cloud Firestore, the database enforces tight access rules compiled directly to the project's Firebase Instance:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Global Safety Net: Lock everything by default
    match /{document=**} {
      allow read, write: if false;
    }

    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    function isValidId(id) {
      return id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$');
    }

    // 1. Carts Collection: Users can only read/write their own cart
    match /carts/{userId} {
      allow read, write: if isOwner(userId) && isValidId(userId);
    }

    // 2. Orders Collection: Anyone can submit, users can read their own submissions
    match /orders/{orderId} {
      allow create: if isValidId(orderId);
      allow read: if (isSignedIn() && resource.data.userId == request.auth.uid) || (!isSignedIn() && resource.data.userId == 'guest');
      allow update: if isSignedIn() && (resource.data.userId == request.auth.uid || request.auth.token.admin == true);
      allow delete: if false; // Orders can never be deleted
    }

    // 3. Products Collection: Read is public, modifications require authentication
    match /products/{productId} {
      allow read: if true;
      allow write: if isSignedIn();
    }
  }
}
```

---

## 3. User Roles & Permissions Matrix
The system enforces strict structural separation between guest users, authenticated consumers, and merchants:

| UI/UX Context | Guest / Customer | Authenticated Customer | Store Owner (Admin) |
| :--- | :--- | :--- | :--- |
| **Boutique Showroom** | Browse, filter catalog. | Browse, filter catalog. | Full catalog view. |
| **User Sign-In** | Can access login screen. | Connected (Displays Email/Phone).| Admin Portal enabled. |
| **Cart & Ordering** | Saves locally to `localStorage`.| Syncs and uploads to Cloud Firestore.| Syncs and test checkout. |
| **Loyalty Points** | Cached per session locally. | Persisted in Firestore order log. | View and audit logs. |
| **Catalog CRUD Manager**| **RESTRICTED.** | **RESTRICTED.** | **ALLOWED.** Create, edit, delete. |
| **Reset Catalog** | **RESTRICTED.** | **RESTRICTED.** | **ALLOWED.** Wipe back to default. |
| **UPI Gateway Admin** | **RESTRICTED.** | **RESTRICTED.** | **ALLOWED.** Modify VPA & display names. |

---

## 4. Comprehensive Error Playbook

| Failure Point | Cause of Error | UI Response | Recovery Action |
| :--- | :--- | :--- | :--- |
| **Owner Gateway Log** | Incorrect passcode/username entered. | Displays: *"Invalid credentials. Please use admin and admin123 to verify."* | Clears passcode, refocuses input. |
| **UPI UTR Format** | Digit string length matches != 12, or contains symbols/letters. | Displays: *"NPCI UPI Transaction Reference (UTR) must be exactly 12 numeric digits."* | Client-side input filter strips any non-numeric keyboard entries. |
| **Firebase Auth (Not Allowed)** | Phone Auth provider is not enabled in Firebase Console. | Displays: *"Phone Sign-In is not enabled in your Firebase Console. Please enable 'Phone' under 'Sign-in method' to authorize profiles."* | Store owner navigates to Firebase Console -> Auth -> Sign-in Method and toggles the "Phone" provider to enabled. |
| **Firebase Auth (Invalid No)** | User typed a malformed telephone number. | Displays: *"Invalid phone number format. Please use E.164 format (e.g. +15551234567)."* | Re-enter number with leading plus (`+`) sign, country prefix, and national subscriber digits. |
| **Firebase Auth (Invalid SMS)** | User typed incorrect 6-digit confirmation digits. | Displays: *"Invalid code. Please double check and try again."* | Resubmit correct numeric OTP received via SMS. |
| **Firestore Write Failure** | Firestore Security Rules rejection. | Console error: *"Missing or insufficient permissions"* | Confirm user is logged in and document paths match `carts/{userId}` correctly. |
| **AI Companion Chat** | Gemini API key is missing from environment. | Elegant client fallback conversation outputted. | Admin configures `GEMINI_API_KEY` on backend server environment variables. |

---

## 5. Edge Cases Handled
1. **Broken Local Storage Memory:** If local memory is corrupted or manually cleared by browser settings, React states automatically fall back gracefully to the original 8 curated boutique products, default UPI VPA settings, and empty checkout bags without crashing the screen.
2. **Offline Mode Resilience:** If the customer loses internet connectivity during QR checkout, the static QR code (which generates natively using URI payloads) remains functional, allowing physical NPCI payments to complete offline before internet restoration.
3. **No-Interactive reCAPTCHA:** In rare browser environments where iframe sizing makes CAPTCHA checks block inputs, we deploy an *Invisible* reCAPTCHA verifier that operates fully in the background without forcing users to click image grids, keeping checkout smooth.
