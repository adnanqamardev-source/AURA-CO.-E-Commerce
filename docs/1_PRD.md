# Product Requirements Document (PRD)

## 1. Problem Statement
Many high-end, curated Indian lifestyle brands and boutique stores face friction when setting up seamless checkout flows for domestic Indian buyers. International payment gateways (like Stripe or PayPal) charge hefty transaction fees (2.5% to 4%+), require complex corporate registrations, and do not natively support the most dominant and preferred payment mechanism in India: **Unified Payments Interface (UPI)**. 

Furthermore, existing e-commerce systems are either too generic or too complex for small boutique owners who simply want to display their curated inventory (Home, Wellness, Work) and receive instant, zero-merchant-fee direct settlements into their business bank account via a static or dynamic UPI QR code.

**Aura & Co.** solves this by providing an exquisite, minimalist, and secure client-facing digital showroom where:
- Indian consumers can browse products, convert currency instantly, and make zero-fee UPI payments by scanning a real-time generated NPCI-compliant QR code.
- Boutique owners can securely control their catalog items (Add, Edit, Delete, Reset) and directly manage UPI payment configurations (VPA ID, Merchant Legal Name) via an authenticated Owner Portal.

---

## 2. Target Users
1. **The Curated Lifestyle Buyer (Meera, 29, Delhi)**:
   - *Tech Comfort Level:* High. Lives on Instagram, uses GPay, PhonePe, and Paytm daily for everything from coffee to designer apparel.
   - *Goals:* Wants a premium, distraction-free shopping experience with clean visual styling and instantly recognizable checkout flows.
   - *Frustrations:* Clunky multi-step card inputs, redirections to unknown external gateway pages, and slow checkout processes.
2. **The Boutique Owner (Rajesh, 42, Mumbai)**:
   - *Tech Comfort Level:* Medium. Comfortable managing digital orders, bank accounts, and spreadsheets.
   - *Goals:* Wants immediate settlement without waiting for standard T+2 gateway payouts, wants to avoid steep processing fees, and wishes to easily customize product prices and VPA handles.
   - *Frustrations:* Complicated merchant dashboards, paying high fees on low-margin boutique goods, and complex catalog update cycles.

---

## 3. Product Vision
To be the absolute gold-standard, lightweight digital showroom engine for boutique merchants in India, combining exquisite minimalist Swiss design with instant, secure, zero-fee direct UPI settlements and effortless inventory controls.

---

## 4. Core Features

| Feature Name | Description | Status / Scope | Priority |
| :--- | :--- | :--- | :--- |
| **Interactive Curated Showcase** | High-contrast visual grid with filter tabs (All, Home, Wellness, Work) displaying exquisite product cards with hover micro-interactions. | Built | **Must-Have** |
| **Multi-Currency Engine** | Real-time currency switching (USD, EUR, GBP, INR) with instant price translation across the entire product catalog. | Built | **Must-Have** |
| **Direct UPI QR Code Generation** | Generates an NPCI-compliant `upi://pay?pa=...` QR code preview inside the checkout drawer, dynamically converting cart totals to INR based on standard exchange rates. | Built | **Must-Have** |
| **NPCI Transaction Verification (UTR)** | Client-side input forcing buyers to enter the 12-digit UPI Transaction Ref (UTR / Ref No.) from their banking receipt to authorize and place orders. | Built (validates 12-digit numeric UTR, stores with order) | **Must-Have** |
| **Secure Owner Dashboard** | Private modal protected by a passcode credentials wall (`admin`/`admin123`) to prevent unauthorized public access. | Built (Vercel serverless verify-passcode endpoint) | **Must-Have** |
| **Direct UPI Gateway Config** | Owner-only panel to toggle UPI checkout, edit the Business UPI VPA ID (handle), and modify the Merchant KYC display name with live QR preview. | Built (live QR preview, persisted in localStorage & Firestore) | **Must-Have** |
| **Catalog CRUD Manager** | Full capability for authorized owners to add new curated arrivals, edit product prices, change categories, upload image URLs, or wipe/reset standard inventory. | Built (full CRUD with Firestore sync) | **Must-Have** |
| **AI Concierge Companion** | Server-side Gemini AI shopping assistant guiding customers on wellness routines, lifestyle pairings, and product inquiries. | Built (Vercel serverless gemini-chat with PRODUCTS injection) | **Must-Have** |
| **Firebase Customer Accounts** | Multi-protocol secure login (Email/Password, Google Sign-In, and **SMS Phone OTP Auth** using invisible reCAPTCHA) with clean, minimalist design. | Built (all 3 methods with error handling & demo account) | **Must-Have** |
| **Firestore Cloud Sync** | High-performance real-time synchronization of customer shopping bags (Carts) and Loyalty logs (Orders) directly with Cloud Firestore. | Built (auto-sync on auth state change) | **Must-Have** |
| **Compliance & Legal Footers** | Interactive footer providing persistent copyright details and launching modal windows for custom-tailored Terms & Conditions and Privacy Policy agreements. | Built | **Must-Have** |

---

## 5. App Flow
1. **Discovery**:
   - User lands on the exquisite showroom. By default, prices are displayed in USD, with an elegant header letting them switch currency immediately.
   - User filters items by clicking "Home", "Wellness", or "Work" tabs, browsing custom animations.
2. **Account Authentication (Optional but Recommended)**:
   - User opens the **Aura Account Portal / Profile** modal to authenticate using their preferred protocol (Email, Google, or direct SMS verification).
   - Once authenticated, their physical checkout parameters and previous orders/loyalty status are securely retrieved from Firestore.
3. **Interactive Cart**:
   - User clicks "Add to Bag", opening a sliding sidebar showing current selections, subtotal, and loyalty points accumulated.
   - User triggers "Checkout".
4. **Checkout Selection**:
   - If UPI is enabled by the owner, the checkout screen prompts the user to select between **💳 Card Payment** or **🇮🇳 UPI QR Code**.
   - If **UPI QR Code** is selected, the app translates the cart total to INR dynamically, formats an NPCI string, and displays a secure QR Code via a trusted rendering service.
   - The user opens their phone's banking/UPI app (GPay, Paytm, PhonePe), scans the QR, authorizes payment, and notes the 12-digit receipt number.
   - The user inputs the 12-digit UTR No. and clicks "Complete Order".
5. **Owner Administrative Loop**:
   - The owner clicks the Shield icon in the navigation bar.
   - If unauthenticated, they are presented with a secure Lock gate requesting username (`admin`) and key (`admin123`).
   - Upon successful authorization, the owner enters the **Owner Dashboard**, structured in two clear tabs:
     - **Catalog Inventory:** Add new products, edit existing descriptions/prices, or delete records.
     - **UPI Payment Gateway:** Disable/enable UPI, change the recipient VPA handle, change the legal display name, and watch the live QR code preview adjust in real-time.

---

## 6. Success Metrics
- **Zero Settlement Delay:** 100% of UPI payments bypass intermediaries and clear instantly to the merchant's bank account.
- **Transaction Costs Saved:** Saves exactly 100% of traditional e-commerce payment gateway merchant service fees (MDR).
- **Administrative Security:** 0% unauthorized access to the business catalog and UPI configuration panel.
- **Durable User Data Retention:** 100% data preservation for consumer carts and orders across multiple distinct client devices.

---

## 7. Out of Scope (Version 1)
- *Automatic Bank Statement Scraping:* Automated UPI deposit confirmation via corporate bank ledger APIs (currently checked manually by owner using the submitted 12-digit UTR).
- *Multi-Merchant Multi-Tenancy:* The software is single-instance optimized for one boutique owner at a time.
