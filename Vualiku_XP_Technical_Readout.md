# Vualiku XP — Technical Readout & Architecture Guide

## 1. Project Overview
**Vualiku XP** is a high-performance, full-stack marketplace and booking platform designed to connect travelers with local eco-tour operators in the Vanua Levu region of Fiji. The platform emphasizes community-driven tourism, sustainability, and seamless digital identity for rural operators.

- **URL:** [vualiku-xp.web.app](https://vualiku-xp.web.app) (Production) / `localhost:9002` (Dev)
- **Primary Region:** Vanua Levu, Fiji
- **Owner:** Meridian Solutions PTE LTD (Clients include Drawa Eco Retreat and others)

---

## 2. Technology Stack

### Core Framework
- **Next.js 15 (App Router):** Using the latest React 19 features, server components, and streaming.
- **TypeScript:** Strict typing across the entire codebase for reliability.
- **Turbopack:** High-speed incremental terminal and build system.

### Database & Backend
- **Firebase Firestore:** Real-time NoSQL database for bookings, applications, activities, and reviews.
- **Firebase Authentication:** Handles user sign-ins, operator identities, and admin roles.
- **Firebase Admin SDK:** Used in API routes for secure server-side operations (e.g., bypass rules, write protected data).
- **Node.js (Next.js Runtime):** Server-side logic for API endpoints.

### Frontend & UI
- **Tailwind CSS:** Utility-first CSS for responsive, performant design.
- **Radix UI:** High-quality, accessible UI primitives (Sheets, Dialogs, Selects, etc.).
- **Lucide React:** Iconography system.
- **Zustand:** Lightweight state management for client-side state (e.g., booking drawer).
- **React Context:** Used for global state via `AuthProvider`, `BasketProvider`, and `LocaleProvider`.
- **Date-fns:** Date manipulation and formatting.
- **Framer Motion:** Smooth micro-animations and page transitions.

### Third-Party Integrations
- **Stripe:** Payment gateway for processing FJD transactions.
- **Twilio:** Messaging gateway for WhatsApp notifications and SMS alerts.
- **OpenWeatherMap API:** Real-time weather data for Vanua Levu.
- **Algolia:** High-performance search index for the tour directory.
- **SendGrid / Postmark (via API):** Transactional email delivery.

---

## 3. Architecture & Data Flow

### Directory Structure
- `/src/app`: Next.js App Router (Routes, Layouts, API endpoints).
- `/src/components`: UI components organized by domain (booking, operator, ai, ui).
- `/src/lib`: Core logic, utility functions, and third-party SDK initializations.
- `/src/hooks`: Custom React hooks for state and data fetching.
- `/src/firebase`: Client-side Firebase configuration and context providers.

### Navigation & Routes
- `/`: Landing page with featured operators and search.
- `/explore`: Interactive map and full activity directory.
- `/directory`: List-based view of all tour operators.
- `/booking`: Multi-step booking flow with dynamic pricing.
- `/operator/dashboard`: Private area for tour companies to manage their business.
- `/profile`: User-specific booking history and settings.
- `/waiver/[id]`: Digital liability waiver signing page.

### Global Components & Logic
- **Header & Footer:** Global navigation and branding.
- **DynamicBackground:** Interactive, theme-aware background elements.
- **StickyBasketBar:** Floating summary of selected items (Mobile & Web).
- **TravelAssistant:** AI-powered chatbot accessible from any page.
- **Toaster:** Notification system for user feedback.

### Data Flow Example: Booking Process
1. **Selection:** User picks a date and time in `BookingDrawer.tsx`.
2. **Pricing:** `calculateDynamicPrice.ts` calculates the final fee on the fly (Season, Demand, Group Size).
3. **API Call:** Form submits to `/api/bookings/create`.
4. **Processing:**
   - Server validates availability and pricing using `MasterEvent` data.
   - `allBookings` collection in Firestore is updated with 'pending' status.
5. **Checkout:** User redirected to Stripe via `/api/checkout/create-session`.
6. **Confirmation:** Stripe Webhook (`/api/checkout/webhook`) receives payment success.
   - Updates Firestore status to 'confirmed'.
   - Triggers `sendBookingConfirmedWhatsApp` via Twilio.

---

## 4. API Endpoints Reference

### 📅 Booking APIs
- `POST /api/bookings/create`: Initializes a new booking record.
- `POST /api/bookings/cancel`: Handles user-initiated or admin-initiated cancellations.

### 💳 Payment APIs
- `POST /api/checkout/create-session`: Generates a Stripe Checkout URL.
- `POST /api/checkout/webhook`: Receives asynchronous payment status updates.

### 🏢 Operator APIs
- `POST /api/operator/applications`: Submits a new tour company application.
- `GET /api/operator/check-admin`: Validates if the current user has administrative privileges.
- `GET /api/operator/activities`: Fetches or updates operator-specific offerings.

### 🤖 Intelligence & Comms
- `POST /api/ai/chat`: Interface for the Genkit-powered Travel Assistant.
- `POST /api/whatsapp/send`: Manually triggers notification messages.
- `POST /api/email/send`: Sends transactional emails for approvals and alerts.

### 🗺️ Data APIs
- `GET /api/weather`: Returns current weather for Vanua Levu (OpenWeather integration).
- `GET /api/v1/catalog`: Public Distribution API endpoint for third-party partners.

---

## 5. Core Logic Modules

### 💰 Dynamic Pricing Engine (`dynamic-pricing.ts`)
The "brain" of the pricing system. It applies multipliers based on:
- **Seasonality:** Peak (June-Sept), Shoulder, and Off-season discounts.
- **Demand Surge:** Price increases as slot capacity fills up.
- **Group Discounts:** Tiered savings for groups of 4, 6, or 10+ people.
- **Timing:** Early-bird rewards (30+ days) and last-minute premiums (<2 days).

### 📝 Digital Waiver System (`pdf-generator.ts`)
Generates legal PDF documents for travelers.
- Captures digital signatures and participant info.
- Stores metadata in Firestore and generates a shareable PDF link for the user and operator.

### 🤖 Komunike Agent (`bot-logic.ts`)
A WhatsApp-integrated support bot that:
- Answers FAQ about the region.
- Checks booking status via natural language.
- Escalates to human operators when necessary.

---

## 6. CSS & Styling

### Design System
- **Colors:** Custom palette defined in `tailwind.config.ts` featuring `vualiku-green`, `ocean-blue`, and `sand-white`.
- **Typography:** Outfit (Headings) and Inter (Body) fonts.
- **Aesthetics:** "Glassmorphism" effects, subtle gradients, and rounded layouts to reflect a premium eco-tourism feel.

### Global Styles (`globals.css`)
- Defines Tailwind base, components, and utility layers.
- Custom animation keyframes for pulse effects and slide-ins.
- Scroll-lock utilities (e.g., `antigravity-scroll-lock` for modals).

---

## 7. Security & Compliance
- **Firestore Security Rules:** Granular access control (Only admins can view applications; only booking owners can see their own data).
- **API Authentication:** Uses `requireAuth` (Firebase ID Tokens) and `requireApiKey` (B2B Partners).
- **Waiver Legal Hold:** Permanent storage of signed liability documents for insurance compliance.

---
*Created by Antigravity AI for Vualiku XP Development Team.*
