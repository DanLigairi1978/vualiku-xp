# Vualiku XP — Full Technical Readout & Specifications

## 1. System Architecture
Vualiku XP is built as a modern, high-performance monorepo utilizing a decentralized architecture to separate administrative control from the public marketplace.

- **Framework**: Next.js 15 (App Router) with TypeScript.
- **Infrastructure**: Firebase (Firestore, Auth, Storage, Hosting).
- **Deployment**: Vercel (CI/CD via GitHub) and Firebase App Hosting.
- **Shared Core**: A `packages/shared` directory containing common types, validation schemas, and business logic (e.g., pricing engines).

---

## 2. Vualiku XP Admin (The Command Centre)
The Admin application is a sophisticated "Command Centre" designed for Meridian Solutions to manage the entire Vualiku ecosystem without touching code.

### 🏢 Operator & Package Management
- **Onboarding Flow**: A multi-step form for registering new eco-tour operators, capturing legal details, insurance, and branding.
- **Package Control**: Granular management of tour offerings, including media galleries, tiered pricing, and availability rules.
- **Approval System**: Admin-only workflow to verify and take operator profiles live.

### 🎨 Branding & Theme Engine
- **Real-time Synchronization**: A dedicated branding module that allows admins to update primary colors, fonts, logos, and UI border-radius via Firestore.
- **System-Wide Impact**: Changes are immediately pushed to the Tourist site via CSS variables, allowing for instant seasonal styling or co-branding.

### 💰 Pricing Control Centre
- **Base Pricing**: Standard rates per adult/child/infant.
- **Date-Specific Overrides**: Ability to set "Surge" or "Discount" pricing for specific calendar dates (e.g., Fiji Day, Christmas).
- **Global Rules**: Automated discounts for large groups or early bookings managed from a single dashboard.

### 🤖 WhatsApp Bot Control
- **Remote Activation**: A master toggle to enable/disable the "Komunike" bot globally.
- **Template Editor**: Admins can edit every bot response message (Start, Search, Confirm, Error) with variable interpolation (e.g., `{{operatorName}}`).
- **Live Preview**: An integrated iPhone simulator that renders real-time previews of WhatsApp message bubbles.

### 📊 Analytics Dashboard
- **Financial Visualization**: Interactive `Recharts` implementation for gross revenue and settlement velocity.
- **Booking Volume**: Bar charts visualizing daily paid bookings and customer flow.
- **Performance Metrics**: Breakdown of operator contributions and average order value (AOV) analysis.

---

## 3. Vualiku XP Tourist Site (The Marketplace)
The Tourist site is a high-conversion frontend designed for speed, beauty, and seamless mobile booking.

### 🛍️ Marketplace Features
- **Dynamic Catalog**: Real-time rendering of active operators and their packages from Firestore.
- **High-Performance Search**: Powered by **Algolia** for instantaneous filtering by region, activity type, and price range.
- **Blog & Content**: A dedicated CMS for publishing eco-tourism articles, community stories, and travel guides.

### 📅 Booking Engine
- **Availability Guard**: Real-time slot checking against master availability rules.
- **Smart Basket**: A global state (`BasketProvider`) that handles multi-item selections and group pricing calculations.
- **Checkout Flow**: Integrated with **Windcave** for secure FJD/USD payment processing.

### 🤖 Decoupled WhatsApp Bot
- **Logic Engine**: The `bot-logic.ts` engine is separate from the UI, fetching its instructions and templates from Firestore.
- **Dynamic Triggers**: Responds to admin-defined "Reset Commands" (e.g., "Bula") to initiate natural language conversations.

---

## 4. Integration & Data Stack

| Service | Purpose |
| :--- | :--- |
| **Firebase Firestore** | Primary NoSQL database with strict security rules. |
| **Firebase Cloud Storage** | Managed media storage with Firestore-aware library mapping. |
| **Algolia** | Enterprise search indexing for operators and packages. |
| **Windcave** | Primary payment gateway (regionally compliant). |
| **Twilio** | WhatsApp Business API provider. |
| **Resend** | Transactional email delivery for booking confirmations. |
| **Google Maps API** | Mapping and proximity calculations for tour locations. |

---

## 5. Data Flow & Security
1.  **State Preservation**: Critical settings (Branding, Pricing, Bot Status) are stored in the `platformConfig` collection.
2.  **Security**: Firestore Security Rules ensure that only authenticated admins can modify configurations, while users can only view their own booking history.
3.  **Synchronization**: The Tourist site listens to Firestore snapshots for branding updates, ensuring the UI "reacts" to admin changes without page refreshes.

---
*Technical Readout compiled by Antigravity AI — March 2026.*
