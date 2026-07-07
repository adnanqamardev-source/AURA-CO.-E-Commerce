# Frontend Specification Document

## 1. Visual Color Palette
Aura & Co. deploys a tailored, elegant, warm high-contrast minimalist editorial theme. Every color has been carefully curated to reflect high-end luxury products and wellness:

- **Warm Ivory / Alabaster (`#faf9f6`):** The primary application canvas background. Eye-safe, editorial, feels like textured organic paper.
- **Deep Charcoal / Onyx (`#111111` / `#1a1a1a`):** Primary headings, buttons, and high-emphasis labels. Delivers strong typographic rhythm.
- **Classic Indigo (`#4f46e5`):** Secure indicators, owner portal triggers, and high-end technical badges.
- **Jade Emerald (`#059669`):** Checked-out order statuses, successful UPI verification, and active system signals.
- **Muted Sage / Sand (`#e2e8f0` / `#f1f5f9`):** Subtle borders, divider rules, and default input field backings.

---

## 2. Typography Strategy
Typography is the core of our editorial identity. Fonts are imported from Google Fonts API to convey premium Swiss modern craftsmanship paired with editorial luxury:

- **Primary Display (Headings, Product Titles):** **Playfair Display** (serif) & **Outfit** (sans-serif)
  - *Feel:* Clean, structural, premium.
  - *Tailwind classes:* `font-sans tracking-tight text-gray-900 font-medium`
- **Body copy (Descriptions, Checkout labels):** **Inter** (sans-serif)
  - *Feel:* Highly readable at small scales, clean layouts.
  - *Tailwind classes:* `font-sans text-xs text-gray-600`
- **Technical & Indicators (Prices, UTRs, VPA handles, Logs):** **JetBrains Mono**
  - *Feel:* Brutalist, reliable, highly scientific.
  - *Tailwind classes:* `font-mono text-xs text-gray-500 uppercase tracking-widest`

---

## 3. Modular Component Designs

### A. Exquisite Product Card
- **Layout:** Vertical grid card.
- **Visual Styles:** Thin `#e2e8f0` sand border, light off-white background, subtle shadow on hover, and smooth scaling on product images.
- **Hover Micro-interaction:** Image enlarges by 3% within its frame (`hover:scale-103 transition-transform duration-500`), and a subtle fade-in of the "Add to Bag" shortcut trigger takes place.

### B. Standard Inputs & Selector Forms
- **Visual Styles:** Background in `#faf9f6` or pure white, thin `#e2e8f0` border.
- **Interactive State:** Border changes to solid deep charcoal on focus (`focus:border-black transition-colors focus:outline-none`).

### C. Standard CTA Buttons
- **Primary CTA:** Solid Onyx background (`bg-black`), white text, bold text, sharp rounded edges (`rounded-lg`). Scales down slightly on click for tactile physical feedback.
- **Secondary CTA:** Thin sand border (`border-gray-200`), muted dark text, light ivory background on hover (`hover:bg-gray-50`).

---

## 4. Spacing & Rhythm Layout Rules
- **Container Sizing:** Desktop views are constrained within a maximum width of `max-w-7xl` with automatic margin centering (`mx-auto px-4 md:px-8`) to prevent layout stretching on ultra-wide monitors.
- **Section Dividers:** Generous, consistent margin bottom spacing (`mb-12` or `space-y-6`) to achieve spacious negative space resembling high-end luxury print catalogs.
- **Visual Rhythm:** Sidebars use standard slide-in motion transforms along the X-axis for logical desktop-first panel expansion.

---

## 5. Third-Party API & Integrations Specification

### A. NPCI UPI Pay QR Code Engine
- **Service Utilized:** QR Server API
- **Base Endpoint:** `https://api.qrserver.com/v1/create-qr-code/`
- **Parameters Sent:**
  - `size`: `180x180`
  - `data`: URL-encoded NPCI standard UPI format string:
    `upi://pay?pa={UPI_ID}&pn={MERCHANT_NAME}&am={INR_AMOUNT}&cu=INR&tn=AuraOrder`
- **Response Received:** Direct PNG image array rendering the scannable transaction square instantly on client screens.

### B. Chat AI Assistant Concierge Proxy
- **Service Utilized:** Server-side Google Gemini SDK (`@google/genai`)
- **Proxy Endpoint:** `/api/gemini/chat`
- **JSON Payload (Input):**
  ```json
  {
    "message": "Do you have any Kyoto incense pairs?",
    "history": [
      { "role": "user", "parts": [{ "text": "Hi" }] },
      { "role": "model", "parts": [{ "text": "Welcome to Aura & Co. Boutique..." }] }
    ]
  }
  ```
- **JSON Response (Output):**
  ```json
  {
    "reply": "Yes, our Kyoto Brass Incense Holder matches perfectly with the Wellness catalog..."
  }
  ```
- **System Instructions Guard:** Restricts Gemini to answering questions specifically related to Aura & Co.'s catalogs, wellness philosophies, and order mechanics, while avoiding technical metadata exposure.

---

## 6. Component Architecture

### Component Hierarchy
```
App.tsx (Root State Machine)
├── Navbar.tsx (Currency, Search, Navigation)
├── ProductCard.tsx (Individual product display)
├── ProductDetailModal.tsx (Detailed product view)
├── CartSidebar.tsx (Cart drawer with checkout flow)
├── UserAuthModal.tsx (Authentication overlay)
├── OwnerPanelModal.tsx (Admin dashboard)
├── OrderHistoryModal.tsx (Order history & loyalty)
└── AiConcierge.tsx (AI chat companion)
```

### State Management
- **Local State:** React `useState` hooks for UI state (modals, cart items, search)
- **Persistence:** `localStorage` for guest mode, Firestore for authenticated users
- **Hybrid Sync:** Automatic synchronization between local storage and Firestore on authentication

---