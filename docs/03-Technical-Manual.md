<![CDATA[
# Vualiku XP — Technical Manual

**Architecture, Troubleshooting & Maintenance Reference**

*Version 1.0 — March 2026*

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Environment Configuration](#4-environment-configuration)
5. [Firebase Services](#5-firebase-services)
6. [External Service Integrations](#6-external-service-integrations)
7. [Core Features — Technical Detail](#7-core-features--technical-detail)
8. [API Endpoints](#8-api-endpoints)
9. [Data Models](#9-data-models)
10. [Build & Deployment](#10-build--deployment)
11. [Troubleshooting Guide](#11-troubleshooting-guide)
12. [Update & Maintenance Procedures](#12-update--maintenance-procedures)
13. [Performance & Security Notes](#13-performance--security-notes)
14. [Technical Readout](#14-technical-readout)

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       CLIENT (Browser)                       │
│  Next.js 14 App Router • React 18 • TypeScript • Tailwind   │
├──────────────┬──────────────┬───────────────┬────────────────┤
│   Pages      │ Components   │  Hooks        │  Context       │
│  /booking    │ search/      │ use-toast     │ BasketContext  │
│  /explore    │ operator/    │ use-booking   │ i18n Provider  │
│  /profile    │ waivers/     │ useUser       │                │
│  /operator/* │ pricing/     │ useFirestore  │                │
│  /waiver/*   │ reviews/     │               │                │
└──────┬───────┴──────┬───────┴───────┬───────┴────────────────┘
       │              │               │
       ▼              ▼               ▼
┌──────────────────────────────────────────────────────────────┐
│                     API ROUTES (Server)                       │
│  /api/payment/charge     /api/email/send-confirmation        │
│  /api/bookings/cancel    /api/operator/approve               │
│  /api/whatsapp/send      /api/waivers/sign                   │
│  /api/ai                                                     │
└──────┬───────┬───────┬───────┬───────┬───────┬───────────────┘
       │       │       │       │       │       │
       ▼       ▼       ▼       ▼       ▼       ▼
   PayDock  Resend  Twilio  Algolia  Gemini  Firebase
  (Payment) (Email) (WhatsApp)(Search) (AI)  (Auth/DB/Host)
```

### Request Flow

```
User Action → React Component → API Route → External Service → Firestore → Response → UI Update
```

---

## 2. Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js (App Router) | 14.x | SSR, API routes, routing |
| **Language** | TypeScript | 5.x | Type safety |
| **UI Library** | React | 18.x | Component architecture |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS |
| **UI Components** | shadcn/ui | Latest | Pre-built accessible components |
| **Icons** | Lucide React | Latest | SVG icon library |
| **Authentication** | Firebase Auth | 10.x | Google OAuth |
| **Database** | Cloud Firestore | 10.x | NoSQL document store |
| **Hosting** | Firebase Hosting | — | Static + SSR hosting |
| **Search** | Algolia | 5.x | Full-text search + faceted filters |
| **Payments** | PayDock | REST | FJD payment processing |
| **Email** | Resend | REST | Transactional email |
| **WhatsApp** | Twilio | REST | WhatsApp Business messaging |
| **AI** | Google Gemini | REST | Travel assistant chatbot |
| **Maps** | Google Maps JS API | 3.x | Interactive adventure map |
| **Internationalisation** | Custom i18n | — | EN/FJ language toggle |

---

## 3. Project Structure

```
Vualiku XP/
├── .env.local                    # Environment variables (secrets)
├── firebase.json                 # Firebase config (hosting, firestore)
├── firestore.rules               # Firestore security rules
├── firestore.indexes.json        # Composite index definitions
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind theme (forest palette)
├── scripts/
│   └── seed-algolia.mjs          # Algolia index seeder
├── public/                       # Static assets (images, manifest)
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── page.tsx              # Homepage
│   │   ├── booking/page.tsx      # Booking flow
│   │   ├── explore/              # Algolia search page
│   │   ├── profile/              # User profile + loyalty
│   │   ├── map/                  # Interactive map
│   │   ├── directory/            # Operator directory
│   │   ├── operator/
│   │   │   ├── login/            # Operator login
│   │   │   ├── dashboard/        # Operator/admin dashboard
│   │   │   └── apply/            # Public application form
│   │   ├── waiver/[bookingId]/   # Digital waiver page
│   │   ├── api/                  # Server-side API routes
│   │   │   ├── payment/charge/   # PayDock charge processing
│   │   │   ├── email/            # Resend email sending
│   │   │   ├── whatsapp/send/    # Twilio WhatsApp
│   │   │   ├── bookings/cancel/  # Cancellation + refund
│   │   │   ├── operator/approve/ # Admin approve/reject
│   │   │   ├── waivers/sign/     # Digital waiver signing
│   │   │   └── ai/              # Gemini AI assistant
│   │   ├── globals.css           # Global styles + design tokens
│   │   ├── layout.tsx            # Root layout
│   │   └── sitemap.ts            # Dynamic sitemap generator
│   ├── components/               # Reusable UI components
│   │   ├── layout/               # Header, footer, nav
│   │   ├── booking/              # Booking-specific components
│   │   ├── search/               # Algolia search components
│   │   ├── operator/             # Analytics, approval queue
│   │   ├── pricing/              # Dynamic pricing breakdown
│   │   ├── waivers/              # Waiver form + signature pad
│   │   ├── reviews/              # Star ratings, review cards
│   │   ├── map/                  # Adventure map
│   │   ├── ai/                   # Travel assistant chat
│   │   └── ui/                   # shadcn/ui base components
│   ├── lib/                      # Utilities and business logic
│   │   ├── booking-data.ts       # MasterEvent definitions
│   │   ├── tour-companies.ts     # Operator data
│   │   ├── currency.ts           # FJD formatting
│   │   ├── booking-utils.ts      # Booking helper functions
│   │   ├── pdf-generator.ts      # Booking PDF generation
│   │   ├── pricing/
│   │   │   └── dynamic-pricing.ts # 4-layer pricing engine
│   │   ├── payments/
│   │   │   └── provider.ts       # Payment abstraction layer
│   │   ├── search/
│   │   │   └── algolia.ts        # Algolia client + types
│   │   ├── email/
│   │   │   └── operator-welcome.ts # Welcome email template
│   │   └── seo.ts                # SEO metadata helpers
│   ├── firebase/                 # Firebase initialisation
│   │   ├── config.ts             # Firebase config object
│   │   └── index.ts              # Auth, Firestore hooks
│   ├── context/                  # React contexts
│   │   ├── BasketContext.tsx      # Shopping basket state
│   │   └── i18n/                 # Internationalisation
│   └── hooks/                    # Custom React hooks
│       ├── use-toast.ts          # Toast notifications
│       └── use-booking-form.ts   # Booking form logic
└── docs/                         # Documentation (you're here)
```

---

## 4. Environment Configuration

### File: `.env.local`

| Variable | Required | Service | Scope |
|----------|---------|---------|-------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Yes | Google Maps | Client |
| `GEMINI_API_KEY` | Yes | Google Gemini | Server |
| `PAYMENT_PROVIDER` | Yes | PayDock | Server |
| `PAYDOCK_PUBLIC_KEY` | Yes | PayDock | Client |
| `PAYDOCK_SECRET_KEY` | Yes | PayDock | Server |
| `PAYDOCK_API_URL` | Yes | PayDock | Server |
| `RESEND_API_KEY` | Yes | Resend | Server |
| `TWILIO_ACCOUNT_SID` | Optional | Twilio | Server |
| `TWILIO_AUTH_TOKEN` | Optional | Twilio | Server |
| `TWILIO_WHATSAPP_NUMBER` | Optional | Twilio | Server |
| `NEXT_PUBLIC_ALGOLIA_APP_ID` | Yes | Algolia | Client |
| `NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY` | Yes | Algolia | Client |
| `ALGOLIA_ADMIN_KEY` | Indexing | Algolia | Server |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | Optional | Google Analytics | Client |
| `WAIVERS_LIVE` | Yes | Feature flag | Server |
| `WHATSAPP_ENABLED` | Yes | Feature flag | Server |

**Scope Legend:**
- `Client` = `NEXT_PUBLIC_` prefix, accessible in browser
- `Server` = Only accessible in API routes and server components

---

## 5. Firebase Services

### Project: `vualiku-xp`

| Service | Usage |
|---------|-------|
| **Firebase Authentication** | Google OAuth sign-in |
| **Cloud Firestore** | Primary database for bookings, reviews, applications, waivers |
| **Firebase Hosting** | Production deployment (static + SSR) |

### Firestore Collections

| Collection | Documents | Key Fields |
|------------|-----------|-----------|
| `allBookings` | Customer bookings | `firstName`, `lastName`, `email`, `bookingDate`, `totalFee`, `participants`, `checkedIn`, `operatorId`, `userId` |
| `reviews` | Activity reviews | `eventId`, `rating`, `comment`, `authorName`, `createdAt` |
| `operatorApplications` | Operator self-onboarding | `businessName`, `contactName`, `email`, `region`, `category`, `status` (pending/approved/rejected), `submittedAt` |
| `waivers` | Signed digital waivers | `bookingId`, `participantName`, `signatureDataUrl`, `agreedToTerms`, `signedAt` |

### Security Rules

Located in `firestore.rules`. Deploy with:
```bash
firebase deploy --only firestore:rules
```

### Composite Indexes

Located in `firestore.indexes.json`. Deploy with:
```bash
firebase deploy --only firestore:indexes
```

---

## 6. External Service Integrations

### PayDock (Payments)

| Item | Detail |
|------|--------|
| **Endpoint** | `https://api.paydock.com/v1` |
| **Integration** | `src/lib/payments/provider.ts` |
| **API Route** | `src/app/api/payment/charge/route.ts` |
| **Currency** | FJD (Fijian Dollars) |
| **Dashboard** | [paydock.com](https://paydock.com) |

### Resend (Email)

| Item | Detail |
|------|--------|
| **Integration** | Direct API calls in route handlers |
| **Templates** | `src/lib/email/operator-welcome.ts` |
| **API Route** | `src/app/api/email/send-confirmation/route.ts` |
| **Free Tier** | 100 emails/day |
| **Dashboard** | [resend.com](https://resend.com) |

### Twilio (WhatsApp)

| Item | Detail |
|------|--------|
| **Feature Flag** | `WHATSAPP_ENABLED` |
| **API Route** | `src/app/api/whatsapp/send/route.ts` |
| **Dashboard** | [twilio.com](https://www.twilio.com) |

### Algolia (Search)

| Item | Detail |
|------|--------|
| **Index Name** | `masterEvents` |
| **Client Config** | `src/lib/search/algolia.ts` |
| **Components** | `src/components/search/` (search-bar, category-filters, price-filter, activity-card) |
| **Page** | `src/app/explore/page.tsx` |
| **Seed Script** | `scripts/seed-algolia.mjs` |
| **Dashboard** | [dashboard.algolia.com](https://dashboard.algolia.com) |

### Google Gemini (AI)

| Item | Detail |
|------|--------|
| **API Route** | `src/app/api/ai/route.ts` |
| **Component** | `src/components/ai/travel-assistant.tsx` |
| **Purpose** | AI travel planning chatbot |

---

## 7. Core Features — Technical Detail

### Dynamic Pricing Engine

**File:** `src/lib/pricing/dynamic-pricing.ts`

Four multiplier layers applied to base prices:

| Layer | Logic | Multiplier Range |
|-------|-------|-----------------|
| **Season** | Based on booking month. Peak = Jun–Sep, Off = Dec–Mar | 0.85 – 1.25 |
| **Demand** | Based on capacity fill rate | 1.0 – 1.30 |
| **Group** | Based on participant count | 0.85 – 1.0 |
| **Timing** | Days until activity date | 0.90 – 1.15 |

**Formula:** `finalPrice = basePrice × season × demand × group × timing`

### Internationalisation (i18n)

**Languages:** English (default), iTaukei Fijian

- Context provider in `src/context/i18n/`
- Translation keys in `src/lib/translations/`
- Language toggle in header navigation
- All user-facing text uses translation keys

### Loyalty Tier System

**File:** `src/app/profile/page.tsx`

| Tier | Minimum Bookings | Computed at |
|------|-----------------|-------------|
| Explorer | 0 | Client-side from `allBookings` query |
| Adventurer | 3 | |
| Pathfinder | 8 | |
| Legend | 15 | |

### Digital Waivers

**Feature Gate:** `WAIVERS_LIVE` environment variable

- **Form:** `src/components/waivers/waiver-form.tsx`
- **Signature:** HTML5 Canvas with touch/mouse support
- **API:** `src/app/api/waivers/sign/route.ts` (POST sign, GET status check)
- **Page:** `/waiver/[bookingId]`

---

## 8. API Endpoints

| Method | Route | Purpose | Auth Required |
|--------|-------|---------|--------------|
| `POST` | `/api/payment/charge` | Process payment via PayDock | No (server-validated) |
| `POST` | `/api/email/send-confirmation` | Send booking confirmation email | No |
| `POST` | `/api/whatsapp/send` | Send WhatsApp notification | No |
| `POST` | `/api/bookings/cancel` | Cancel booking + optional refund | No |
| `POST` | `/api/operator/approve` | Approve/reject operator application | Admin |
| `POST` | `/api/waivers/sign` | Sign digital waiver | No |
| `GET`  | `/api/waivers/sign` | Check if waivers are enabled | No |
| `POST` | `/api/ai` | Chat with AI travel assistant | No |

---

## 9. Data Models

### MasterEvent (Activity Definition)

```typescript
interface MasterEvent {
  id: string;              // Unique event ID (e.g., 'evt_waisali_zip')
  operatorId: string;      // Operator slug (e.g., 'waisali-nature-experience')
  operatorName: string;    // Display name
  name: string;            // Activity name (e.g., 'Zip Lining')
  price: number;           // Base price in FJD
  pricingType: 'per_head' | 'per_night';
  durationDesc: string;    // Human-readable duration
  slotId: TimeSlotId;      // Time slot category
  imageUrl?: string;       // Path to activity image
  category?: string;       // Category for filtering
}
```

### TourCompany (Operator Definition)

```typescript
interface TourCompany {
  id: string;
  name: string;
  description: string;
  imageId: string;
  bookingLink: string;
}
```

### Booking (Firestore Document)

```typescript
interface Booking {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bookingDate: string;
  totalFee: number;
  participants: number;
  checkedIn: boolean;
  operatorId?: string;
  operatorName?: string;
  eventName?: string;
  createdAt: Timestamp;
}
```

---

## 10. Build & Deployment

### Local Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev
```

### Production Build

```bash
# Build for production
npx next build

# Test production build locally
npx next start
```

### Deploy to Firebase

```bash
# Deploy everything (hosting + rules + indexes)
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy only Firestore indexes
firebase deploy --only firestore:indexes
```

### Re-Index Algolia

```bash
node scripts/seed-algolia.mjs
```

---

## 11. Troubleshooting Guide

### Build Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Module not found` | Missing dependency | Run `npm install` |
| `NEXT_PUBLIC_ undefined` | Env var not set | Add to `.env.local` and restart dev server |
| `Firebase initialization failed` | Missing Firebase config or not deployed | Normal during build; only fails in production if config is missing |
| `Type error` | TypeScript mismatch | Check the specific file and line; run `npx tsc --noEmit` to find all type errors |

### Runtime Errors

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| "This site can't be reached" (localhost) | Dev server not running or port conflict | Run `npm run dev` or kill process on port 3000 |
| Blank page after deploy | Build error or missing env vars | Check Firebase Console → Hosting → Recent deploys |
| Bookings not saving | Firestore rules blocking writes | Check `firestore.rules` and deploy |
| Search not working | Algolia not indexed or keys wrong | Verify keys in `.env.local`, run seed script |
| Emails not sending | Invalid Resend API key or quota exceeded | Check [resend.com](https://resend.com) dashboard |
| WhatsApp not sending | Twilio credentials missing or sandbox | Check Twilio dashboard and `WHATSAPP_ENABLED` flag |
| AI assistant not responding | Invalid Gemini API key | Verify `GEMINI_API_KEY` in `.env.local` |
| Payment failing | PayDock keys not set or in wrong mode | Use sandbox keys for testing, live keys for production |

### Diagnostic Commands

```bash
# Check Node.js version
node --version       # Should be 18+

# Check for TypeScript errors
npx tsc --noEmit

# Check Next.js build
npx next build

# Check Firebase CLI
firebase --version

# View Firebase project info
firebase projects:list

# Check Algolia index
node scripts/seed-algolia.mjs
```

---

## 12. Update & Maintenance Procedures

### Adding a New Activity

1. Edit `src/lib/booking-data.ts` → add entry to `masterEvents` array
2. Add the activity image to `public/`
3. Re-run Algolia seeder: `node scripts/seed-algolia.mjs`
4. Rebuild and deploy: `npx next build && firebase deploy`

### Adding a New Operator

1. Edit `src/lib/tour-companies.ts` → add entry to `tourCompanies` array
2. Add their activities to `src/lib/booking-data.ts`
3. Add operator image to `public/`
4. Re-run Algolia seeder
5. Update map markers if needed: `src/components/map/adventure-map.tsx`
6. Rebuild and deploy

### Adding a New Admin Email

1. Edit `src/app/operator/dashboard/page.tsx`
2. Find `ADMIN_EMAILS` array
3. Add the new email string
4. Rebuild and deploy

### Updating Firebase Security Rules

1. Edit `firestore.rules`
2. Test locally: `firebase emulators:start`
3. Deploy: `firebase deploy --only firestore:rules`

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update all safe updates
npm update

# Update a specific package
npm install package-name@latest

# After updating, always test
npx next build
```

### Rotating API Keys

If a key is compromised:

1. Generate a new key on the respective service dashboard
2. Update `.env.local` with the new key
3. **Do NOT** commit `.env.local` to git (it should be in `.gitignore`)
4. Restart the dev server or redeploy to production

---

## 13. Performance & Security Notes

### Security

| Concern | Mitigation |
|---------|-----------|
| API keys exposed | Client keys are read-only (Algolia search, Maps). Secret keys are server-only. |
| Firestore access | Security rules restrict reads/writes to authenticated users |
| Payment data | Never stored locally; handled entirely by PayDock |
| CORS | API routes only accept requests from the same origin |
| Env vars | `.env.local` is in `.gitignore` and never committed |

### Performance

| Area | Optimisation |
|------|-------------|
| Images | Served from `/public` via Firebase CDN |
| Search | Algolia provides sub-50ms search responses |
| Bundle | Next.js automatic code splitting per route |
| Fonts | Google Fonts loaded via `next/font` with preloading |
| CSS | Tailwind purges unused styles in production |

---

## 14. Technical Readout

### Project Summary

| Metric | Value |
|--------|-------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5.x |
| **Total Routes** | 12 pages, 7 API routes |
| **Components** | 40+ React components |
| **External Services** | 6 (Firebase, PayDock, Resend, Twilio, Algolia, Gemini) |
| **Operators** | 7 registered |
| **Activities** | 22 indexed |
| **Languages** | 2 (English, iTaukei Fijian) |
| **Currency** | FJD (Fijian Dollar) |
| **Feature Flags** | 2 (WAIVERS_LIVE, WHATSAPP_ENABLED) |
| **Loyalty Tiers** | 4 (Explorer → Adventurer → Pathfinder → Legend) |
| **Pricing Layers** | 4 (Season, Demand, Group, Timing) |
| **Build Time** | ~22–30 seconds |
| **Hosting** | Firebase Hosting (vualiku-xp.web.app) |
| **Authentication** | Google OAuth via Firebase Auth |
| **Database** | Cloud Firestore (4 collections) |
| **Search Index** | Algolia `masterEvents` (22 records) |

### Firebase Project Details

| Property | Value |
|----------|-------|
| Project ID | `vualiku-xp` |
| Auth Domain | `vualiku-xp.firebaseapp.com` |
| Storage Bucket | `vualiku-xp.firebasestorage.app` |
| Hosting URL | `https://vualiku-xp.web.app` |
| Measurement ID | `G-DRM51RETB4` |

### Key File Locations

| Purpose | File |
|---------|------|
| Firebase config | `src/firebase/config.ts` |
| Activity data | `src/lib/booking-data.ts` |
| Operator data | `src/lib/tour-companies.ts` |
| Pricing engine | `src/lib/pricing/dynamic-pricing.ts` |
| Environment vars | `.env.local` |
| Algolia seeder | `scripts/seed-algolia.mjs` |
| Admin emails | `src/app/operator/dashboard/page.tsx` (ADMIN_EMAILS) |
| Firestore rules | `firestore.rules` |
| Site metadata | `src/app/layout.tsx` + individual `layout.tsx` files |
| Sitemap | `src/app/sitemap.ts` |

---

*Vualiku XP — Community-Led Eco-Tourism, Vanua Levu, Fiji 🇫🇯*

*© 2026 Vualiku XP. All rights reserved.*
]]>
