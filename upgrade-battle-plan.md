# ⚔️ VUALIKU XP — THE UPGRADE BATTLE PLAN
### *From Prototype to Platform. No Fluff. Just Steps.*

> **Date:** 27 February 2026  
> **Status:** Pre-Sprint Zero  
> **Stack:** Next.js 15 · Firebase · Genkit AI · Stripe (incoming)  
> **Who:** You (Dan) + Me (Antigravity AI)

---

## The Honest Truth

Let's be real about where we stand.

Vualiku XP already has some things that most small booking platforms *dream* about — AI trip planning, conflict-aware scheduling, QR check-in, offline mode. That stuff is genuinely impressive. But right now, **nobody can actually pay us money**. There's no confirmation email. No reviews. No way for Google to even find us. 

We've built the engine of a Ferrari, but we forgot the steering wheel and the doors.

This document is the blueprint to bolt everything on — in order, without burning out, and without breaking what already works.

---

## How This Works

Every phase below follows the same pattern:

| Symbol | Meaning |
|--------|---------|
| 🤖 **Antigravity does it** | I build it. You review it. |
| 🧑‍💻 **Dan does it** | Requires your accounts, keys, or manual setup. |
| 🤝 **We do it together** | Pair-programming session. |
| ⏱️ **Estimated time** | Realistic dev time, not marketing time. |

---

## PHASE 1: TABLE STAKES 🔴
### *"If we don't do this, nothing else matters."*

These are the features every single booking platform on Earth has. Without them, Vualiku XP isn't a booking system — it's a brochure with extra steps.

---

### 1.1 — Live Payment Processing (Stripe)

**The problem:** The checkout buttons literally do nothing. Users build a whole itinerary, get excited, click "Pay" — and nothing happens. That's the worst possible user experience.

**What we're building:**
- Stripe Checkout integration with real card processing
- Support for Visa, Mastercard, Apple Pay, Google Pay
- Dual currency: USD and FJD
- Payment status saved on each booking in Firestore (`paid`, `pending`, `failed`)
- Stripe webhook listener to confirm payments server-side

**The steps:**

| # | Step | Who | Details |
|---|------|-----|---------|
| 1 | Create a Stripe account | 🧑‍💻 Dan | Go to [stripe.com](https://stripe.com), sign up, complete business verification. You'll need bank details for Fiji payouts. |
| 2 | Get API keys | 🧑‍💻 Dan | From Stripe Dashboard → Developers → API Keys. Copy the **publishable key** and **secret key**. Add both to `.env.local`. |
| 3 | Install Stripe packages | 🤖 Antigravity | `npm install @stripe/stripe-js @stripe/react-stripe-js stripe` |
| 4 | Build `/api/checkout/create-session` | 🤖 Antigravity | Server-side route that creates a Stripe Checkout Session from the basket items. |
| 5 | Build `/api/checkout/webhook` | 🤖 Antigravity | Webhook endpoint that listens for `checkout.session.completed` events and updates the Firestore booking doc with `paymentStatus: 'paid'` and `stripeSessionId`. |
| 6 | Replace fake checkout buttons | 🤖 Antigravity | Swap the static "Pay with Credit Card" and PayPal buttons with a real Stripe redirect flow. |
| 7 | Build `/booking/success` page | 🤖 Antigravity | Post-payment landing page showing confirmation, QR code, and PDF download. |
| 8 | Build `/booking/cancelled` page | 🤖 Antigravity | "Payment was cancelled" page with a link back to checkout. |
| 9 | Test end-to-end with Stripe test cards | 🤝 Together | Use `4242 4242 4242 4242` to simulate successful payments. Verify Firestore updates. |
| 10 | Enable Stripe live mode | 🧑‍💻 Dan | Flip the switch in Stripe Dashboard when ready for real transactions. |

⏱️ **Estimated effort:** 1 session to build, 1 session to test.

---

### 1.2 — Booking Confirmation Emails

**The problem:** User pays money. Gets nothing. No email. No receipt. No ticket. They're left wondering if it even worked.

**What we're building:**
- Automatic confirmation email on successful payment
- Includes: booking summary, QR code image, PDF itinerary attachment
- 24-hour pre-trip reminder email
- Post-trip review request email

**The steps:**

| # | Step | Who | Details |
|---|------|-----|---------|
| 1 | Choose email provider | 🤝 Together | **Option A:** Firebase "Trigger Email" extension (free, uses your SMTP). **Option B:** Resend API (cleaner, $0 for 3K emails/month). I recommend **Resend** — it's faster to set up and has better templates. |
| 2 | Sign up for Resend | 🧑‍💻 Dan | [resend.com](https://resend.com) → sign up → verify your domain or use their sandbox for testing. Get API key. |
| 3 | Add Resend API key to `.env.local` | 🧑‍💻 Dan | `RESEND_API_KEY=re_xxxxxxxxxxxx` |
| 4 | Install Resend + React Email | 🤖 Antigravity | `npm install resend @react-email/components` |
| 5 | Design email templates | 🤖 Antigravity | Build React Email components: `BookingConfirmation.tsx`, `TripReminder.tsx`, `ReviewRequest.tsx`. Branded with Vualiku XP styling. |
| 6 | Build `/api/email/send-confirmation` | 🤖 Antigravity | API route triggered after Stripe webhook confirms payment. Sends the confirmation email with QR code embedded. |
| 7 | Build scheduled reminder logic | 🤖 Antigravity | Firebase Cloud Function (or a cron-triggered Firestore query) that sends a reminder email 24 hours before each booking date. |
| 8 | Test with real inboxes | 🤝 Together | Send test emails to Gmail, Yahoo, and Outlook. Check spam scores. |

⏱️ **Estimated effort:** 1 session.

---

### 1.3 — Reviews & Ratings System

**The problem:** Social proof sells. 93% of travelers read reviews before booking. We have literally zero. Every operator card shows a hardcoded "⭐ 4.9" that means nothing.

**What we're building:**
- `reviews` collection in Firestore
- Star rating (1-5) + text review per booking
- Review submission form accessible after check-in
- Aggregate ratings displayed on operator cards and activity listings
- Admin moderation capability (approve/hide reviews)

**The steps:**

| # | Step | Who | Details |
|---|------|-----|---------|
| 1 | Design Firestore schema | 🤖 Antigravity | `reviews/{reviewId}`: `userId`, `operatorId`, `eventName`, `rating` (1-5), `text`, `createdAt`, `status` (pending/approved/hidden). |
| 2 | Build review submission page | 🤖 Antigravity | `/review/{bookingId}` — form with star picker and text area. Only accessible to the booking owner, only after check-in. |
| 3 | Build `<StarRating>` component | 🤖 Antigravity | Reusable component showing interactive stars (for input) and static stars (for display). |
| 4 | Add review trigger email | 🤖 Antigravity | 2 days after the booking date, auto-send a "How was your adventure?" email with a link to the review form. |
| 5 | Display ratings on cards | 🤖 Antigravity | Replace the fake "⭐ 4.9" with real aggregated scores calculated from approved reviews. |
| 6 | Add review moderation to admin dashboard | 🤖 Antigravity | New tab on `/operator/dashboard` showing pending reviews with approve/hide buttons. |
| 7 | Update Firestore security rules | 🤖 Antigravity | Users can create reviews for their own bookings. Only admins can update status. |

⏱️ **Estimated effort:** 1 session.

---

## PHASE 2: CATCH THE PACK 🟡
### *"These are what separate a real platform from a weekend project."*

---

### 2.1 — Search & Discovery Page (`/explore`)

**The problem:** Right now, finding an activity means knowing which operator to select from a dropdown, then scrolling through another dropdown. That's three clicks before you even see what's available. Viator and GetYourGuide let users browse thousands of activities with one search bar.

**What we're building:**
- Dedicated `/explore` page as the main entry point for discovery
- Full-text search with instant filtering
- Visual category cards (Land & Trekking, Water & Coastal, Cultural, Overnight)
- Price range slider (Radix `<Slider>` — already in our deps)
- Duration filter (Short <2h, Half Day, Full Day, Overnight)
- Sort by: Price Low→High, Price High→Low, Rating, Duration
- Grid view with activity cards showing image, name, operator, rating, price
- "Add to Basket" quick-action from each card

| # | Step | Who |
|---|------|-----|
| 1 | Create `/explore/page.tsx` with the search/filter layout | 🤖 Antigravity |
| 2 | Build `<ActivityCard>` component with rating, price, image | 🤖 Antigravity |
| 3 | Build filter sidebar with category, price, duration controls | 🤖 Antigravity |
| 4 | Wire up search + filter state management | 🤖 Antigravity |
| 5 | Add "Add to Basket" functionality on each card | 🤖 Antigravity |
| 6 | Update header navigation to include "Explore" link | 🤖 Antigravity |
| 7 | Mobile-responsive layout testing | 🤝 Together |

⏱️ **Estimated effort:** 1 session.

---

### 2.2 — Cancellation & Refund Workflow

**The problem:** Once a booking is made, there is no way to cancel it. No way for customers to request a refund. No way for admins to process one. If someone's flight gets cancelled, they're stuck. Viator offers free cancellation up to 24 hours before on most experiences.

**What we're building:**
- Booking lifecycle: `confirmed` → `cancelled` → `refund_pending` → `refunded`
- User-facing "Cancel Booking" button on member dashboard (within 48-hour window)
- Admin "Process Refund" and "Force Cancel" on operator dashboard
- Stripe Refund API integration (auto-refund on cancellation)
- Cancellation policy displayed on booking form

| # | Step | Who |
|---|------|-----|
| 1 | Add `status` and `cancellationPolicy` fields to booking schema | 🤖 Antigravity |
| 2 | Build cancellation UI on member dashboard | 🤖 Antigravity |
| 3 | Build admin refund controls on operator dashboard | 🤖 Antigravity |
| 4 | Create `/api/bookings/cancel` route with Stripe refund call | 🤖 Antigravity |
| 5 | Send cancellation confirmation email | 🤖 Antigravity |
| 6 | Display cancellation policy on booking form | 🤖 Antigravity |
| 7 | Test full cycle: book → pay → cancel → refund → verify | 🤝 Together |

⏱️ **Estimated effort:** 1 session.

---

### 2.3 — Multi-Language (i18n) + FJD Currency

**The problem:** We're a Fijian platform that only speaks English and only shows USD prices. That's a problem for local operators, iTaukei communities, and Indo-Fijian markets.

**What we're building:**
- `next-intl` integration for full i18n
- Three languages: English (default), iTaukei Fijian, Hindi
- Language toggle in the header (globe icon)
- FJD/USD currency switcher with live conversion rates
- All static text wrapped in translation functions

| # | Step | Who |
|---|------|-----|
| 1 | Install and configure `next-intl` | 🤖 Antigravity |
| 2 | Extract all static strings to `/messages/en.json` | 🤖 Antigravity |
| 3 | Write iTaukei Fijian translations | 🧑‍💻 Dan | You'll need native speakers to verify — I can provide a machine-translated draft, but this needs human review. |
| 4 | Write Hindi translations | 🧑‍💻 Dan | Same as above. |
| 5 | Build language toggle component | 🤖 Antigravity |
| 6 | Build currency switcher with FJD/USD toggle | 🤖 Antigravity |
| 7 | Test all pages in all three languages | 🤝 Together |

⏱️ **Estimated effort:** 1 session for scaffolding, ongoing effort for translations.

---

### 2.4 — SEO & Social Sharing

**The problem:** If you Google "Fiji adventure tours" or "Vanua Levu eco tourism" right now, Vualiku XP doesn't show up anywhere. There's no structured data, no sitemap, no meta tags, and no analytics to even know if anyone visits.

**What we're building:**
- JSON-LD structured data (`TouristAttraction`, `Event`, `Organization`)
- Open Graph + Twitter Card meta tags on every page
- Dynamic `sitemap.xml` generation
- `robots.txt`
- Google Analytics 4 integration
- Google Search Console submission

| # | Step | Who |
|---|------|-----|
| 1 | Add Next.js `metadata` exports to all page files | 🤖 Antigravity |
| 2 | Build JSON-LD generators for operators and events | 🤖 Antigravity |
| 3 | Create dynamic `sitemap.xml` route | 🤖 Antigravity |
| 4 | Create `robots.txt` | 🤖 Antigravity |
| 5 | Set up Google Analytics 4 property | 🧑‍💻 Dan | Go to analytics.google.com → create property → get measurement ID. |
| 6 | Install `@next/third-parties` and add GA4 | 🤖 Antigravity |
| 7 | Submit sitemap to Google Search Console | 🧑‍💻 Dan | [search.google.com/search-console](https://search.google.com/search-console) → add property → submit sitemap. |

⏱️ **Estimated effort:** 1 quick session.

---

## PHASE 3: OVERTAKE THE PACK 🟢
### *"This is where we stop copying and start leading."*

These features go beyond what most activity-booking platforms offer. This is where Vualiku XP's unique position — community-led, AI-powered, Pacific Islands niche — becomes an actual competitive moat.

---

### 3.1 — Operator Analytics Dashboard

**What the big guys have:** Checkfront gives operators revenue charts, occupancy rates, and booking trends. Airbnb gives hosts earning projections and pricing recommendations.

**What we're building:**
- `/operator/analytics` page (admin only)
- Revenue over time (line chart — weekly/monthly toggle)
- Bookings by activity (pie/donut chart)
- Bookings by time slot (bar chart — shows which slots are most popular)
- Popular dates heatmap (calendar view)
- Guest count trends
- All powered by aggregating Firestore booking data

**Libraries:** We already have `recharts` in `package.json` — so zero new dependencies.

| # | Step | Who |
|---|------|-----|
| 1 | Create `/operator/analytics/page.tsx` | 🤖 Antigravity |
| 2 | Build Firestore aggregation queries | 🤖 Antigravity |
| 3 | Build revenue line chart component | 🤖 Antigravity |
| 4 | Build activity breakdown pie chart | 🤖 Antigravity |
| 5 | Build time slot popularity bar chart | 🤖 Antigravity |
| 6 | Build booking calendar heatmap | 🤖 Antigravity |
| 7 | Add navigation link from dashboard | 🤖 Antigravity |
| 8 | Test with real booking data | 🤝 Together |

⏱️ **Estimated effort:** 1 session.

---

### 3.2 — User Profile, Booking History & Loyalty

**What the big guys have:** Booking.com's Genius program has 3 tiers with escalating discounts. Airbnb profiles show reviews, verified identity, and trip history.

**What we're building:**
- `/profile` page with avatar, display name, email, phone, and edit capability
- Complete booking history (past + upcoming) with status badges
- "Favourite" operators (heart icon → saved list)
- **Vualiku Rewards** tier system:

| Tier | Requirement | Perks |
|------|-------------|-------|
| 🥉 Explorer | 1-2 bookings | Welcome badge, priority support |
| 🥈 Adventurer | 3-5 bookings | 5% discount code, free gear rental |
| 🥇 Legend | 6+ bookings | 10% discount, priority booking, VIP events |

| # | Step | Who |
|---|------|-----|
| 1 | Create `/profile/page.tsx` | 🤖 Antigravity |
| 2 | Build booking history with status badges | 🤖 Antigravity |
| 3 | Build favourites system (heart + saved list) | 🤖 Antigravity |
| 4 | Design loyalty tier logic | 🤖 Antigravity |
| 5 | Build loyalty badge display component | 🤖 Antigravity |
| 6 | Build discount code generation and validation | 🤖 Antigravity |
| 7 | Decide on actual perks and partnerships | 🧑‍💻 Dan | This is a business decision — what can you actually offer at each tier? |

⏱️ **Estimated effort:** 1-2 sessions.

---

### 3.3 — Dynamic Pricing Engine

**What the big guys have:** Booking.com adjusts prices per-minute based on demand. Airbnb suggests pricing based on local events, seasonality, and competitor rates.

**What we're building (simplified version that still packs a punch):**
- Peak season multiplier (e.g., July-September = 1.2x)
- Weekend surcharge (e.g., Friday-Sunday = 1.1x)
- Early bird discount (book 30+ days ahead = 10% off)
- Group discount (10+ pax = 15% off)
- Low-demand flash sales (operator-triggered)
- All configurable per-operator from the admin dashboard

| # | Step | Who |
|---|------|-----|
| 1 | Design pricing rules schema | 🤖 Antigravity |
| 2 | Build pricing rules editor in operator dashboard | 🤖 Antigravity |
| 3 | Build price calculation engine (`calculateDynamicPrice()`) | 🤖 Antigravity |
| 4 | Display original vs. discounted price on activity cards | 🤖 Antigravity |
| 5 | Define actual peak seasons and pricing for each operator | 🧑‍💻 Dan |
| 6 | Test pricing across various scenarios | 🤝 Together |

⏱️ **Estimated effort:** 1 session.

---

### 3.4 — Channel Distribution API

**What the big guys have:** Checkfront syncs availability to Viator, GetYourGuide, Expedia, and Google Things To Do simultaneously.

**What we're building:**
- Public REST API under `/api/v1/`
- Endpoints: `GET /activities`, `GET /availability/{date}`, `POST /reserve`
- API key authentication for partners
- OpenAPI/Swagger documentation
- This lets us eventually feed inventory into Google Things to Do, Viator Supplier Network, and GetYourGuide's marketplace without rebuilding anything

| # | Step | Who |
|---|------|-----|
| 1 | Design API schema and endpoints | 🤖 Antigravity |
| 2 | Build activity listing endpoint | 🤖 Antigravity |
| 3 | Build availability query endpoint | 🤖 Antigravity |
| 4 | Build reservation endpoint | 🤖 Antigravity |
| 5 | Build API key generation and validation | 🤖 Antigravity |
| 6 | Generate Swagger documentation | 🤖 Antigravity |
| 7 | Apply to Google Things to Do partner program | 🧑‍💻 Dan |
| 8 | Apply to Viator Supplier program | 🧑‍💻 Dan |

⏱️ **Estimated effort:** 2 sessions.

---

### 3.5 — Digital Waivers & Liability Forms

**What the big guys have:** Checkfront has a custom waiver builder with e-signature capture. GetYourGuide requires operator-level liability coverage.

**What we're building:**
- Custom waiver form per activity (configurable by admin)
- E-signature capture (canvas-based signature pad)
- Waiver must be signed before QR code is issued
- Signed waivers stored in Firebase Storage as PDFs
- Linked to booking documents for legal compliance

| # | Step | Who |
|---|------|-----|
| 1 | Build signature pad component | 🤖 Antigravity |
| 2 | Build waiver template system | 🤖 Antigravity |
| 3 | Integrate waiver gate into booking flow | 🤖 Antigravity |
| 4 | Store signed waivers in Firebase Storage | 🤖 Antigravity |
| 5 | Draft actual waiver content | 🧑‍💻 Dan | This needs legal review for Fiji tourism regulations. |

⏱️ **Estimated effort:** 1 session (code), ongoing (legal content).

---

## PHASE 4: THE "NOBODY ELSE HAS THIS" PLAYS 🚀
### *Pacific-first features that make Vualiku XP impossible to replicate.*

---

### 4.1 — AI Demand Forecasting

Use our existing Genkit AI integration to analyze booking patterns and predict demand. Show operators: "Next Saturday is projected to have 3x normal demand for river rafting — consider adding a second timeslot." No other Pacific Islands booking platform has anything close to this.

### 4.2 — Community Revenue Dashboard

Transparent revenue sharing visible to community stakeholders. Show how much revenue each village/community has generated, with breakdowns by activity. This aligns with the eco-tourism, community-first mission and builds trust with operators.

### 4.3 — WhatsApp Booking Bot

Most of Fiji runs on WhatsApp. Build a WhatsApp Business API integration that lets users browse activities and make bookings directly via chat. This sidesteps the "download our app" barrier entirely.

### 4.4 — Weather-Aware Scheduling

Integrate a weather API to show real-time conditions at each operator location. Auto-suggest rescheduling if heavy rain is forecast for an outdoor activity. No booking platform in the Pacific does this.

### 4.5 — Cultural Calendar Integration

Overlay Fijian cultural events (village ceremonies, church dates, public holidays) on the booking calendar. Auto-block dates when operators indicate cultural obligations. This respects iTaukei customs in a way that no Western booking platform would even think to do.

---

## The Sprint Calendar

Here's the real talk on how fast we can move if we go hard:

| Sprint | Phase | Focus | Sessions |
|--------|-------|-------|----------|
| **Sprint 1** | 🔴 Phase 1 | Stripe Payments + Confirmation Emails | 2 sessions |
| **Sprint 2** | 🔴 Phase 1 | Reviews System + Rating Display | 1 session |
| **Sprint 3** | 🟡 Phase 2 | Search/Explore Page + Cancellation Flow | 2 sessions |
| **Sprint 4** | 🟡 Phase 2 | i18n (3 Languages) + SEO Setup | 2 sessions |
| **Sprint 5** | 🟢 Phase 3 | Analytics Dashboard + User Profiles | 2 sessions |
| **Sprint 6** | 🟢 Phase 3 | Dynamic Pricing + Digital Waivers | 2 sessions |
| **Sprint 7** | 🟢 Phase 3 | Distribution API + Swagger Docs | 2 sessions |
| **Sprint 8** | 🚀 Phase 4 | AI Forecasting + Community Dashboard | 2 sessions |

**Total: ~15 sessions to go from where we are to beyond industry standard.**

---

## What You Need To Do Before We Start

These are the things only you can do. I can't create accounts or provide bank details for you.

- [ ] **Create a Stripe account** at [stripe.com](https://stripe.com) — complete business verification
- [ ] **Create a Resend account** at [resend.com](https://resend.com) — get API key
- [ ] **Create a Google Analytics 4 property** at [analytics.google.com](https://analytics.google.com)
- [ ] **Decide on cancellation policy** — how many hours before the trip can users cancel for free?
- [ ] **Decide on loyalty tier perks** — what can you realistically offer at each tier?
- [ ] **Line up iTaukei and Hindi translators** — machine translation gets us 80% there, but the last 20% needs native speakers
- [ ] **Get legal advice on waiver content** — what liability language is required for Fiji adventure tourism?

Once you tick these off, we can start Sprint 1 immediately.

---

> **The bottom line:** We're not trying to become Booking.com. We're building the best community-led adventure booking platform in the Pacific — and then we're giving the world access to it. The AI, the offline mode, the eco-tourism DNA — that's our edge. We just need to stop leaving money on the table by missing the basics.
>
> Let's go build it. 🌿

---

*Battle plan drafted by Antigravity AI — 27 February 2026*
