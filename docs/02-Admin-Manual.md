<![CDATA[
# Vualiku XP — Administrator Manual

**A Plain-Language Guide to Running Your Platform**

*Version 1.0 — March 2026*

---

## Welcome, Admin!

This manual is written in simple language with everyday analogies so anyone on the team can confidently manage the Vualiku XP platform. No coding experience required for most tasks.

> **Think of Vualiku XP like a marketplace stall.** You're the market manager. Operators are the stall holders. Customers are the visitors. Your job is to keep the market running smoothly, approve new stall holders, and make sure everyone has a good experience.

---

## Table of Contents

1. [Logging In](#1-logging-in)
2. [The Operator Dashboard](#2-the-operator-dashboard)
3. [Understanding Analytics](#3-understanding-analytics)
4. [Managing Bookings](#4-managing-bookings)
5. [Approving New Operators](#5-approving-new-operators)
6. [Managing Reviews](#6-managing-reviews)
7. [Email Notifications](#7-email-notifications)
8. [WhatsApp Notifications](#8-whatsapp-notifications)
9. [Search (Algolia)](#9-search-algolia)
10. [Feature Flags](#10-feature-flags)
11. [Routine Maintenance](#11-routine-maintenance)
12. [Common Scenarios](#12-common-scenarios)
13. [Admin Contact List](#13-admin-contact-list)

---

## 1. Logging In

### Who Can Access the Admin Dashboard?

Only approved email addresses can access administrator features. Currently authorised:

| Email | Role |
|-------|------|
| ligarius22@gmail.com | Admin |
| dbucks3671@gmail.com | Admin |
| navareafarm@gmail.com | Admin |
| bulutani@yahoo.com | Admin |

### How to Log In

1. Go to **https://vualiku-xp.web.app**
2. Click **Sign In** (top-right)
3. Sign in with your authorised Google account
4. Click **your avatar** → **Dashboard**

> **Analogy:** Logging in is like using your key to open the market manager's office. Only people with the right key (approved emails) can get in.

---

## 2. The Operator Dashboard

When you open the Dashboard, you'll see three main sections from top to bottom:

### Section 1: Analytics Overview
Charts and numbers showing how the business is performing (more on this below).

### Section 2: Upcoming Tours
Cards showing all upcoming bookings with customer names, dates, participant counts, and check-in buttons.

### Section 3: Operator Applications (Admin Only)
A queue of new operator applications waiting for your approval.

> **Analogy:** Think of the Dashboard as your office noticeboard. The top section shows your sales summary, the middle shows today's customer appointments, and the bottom shows applications from people who want to set up a stall in your market.

---

## 3. Understanding Analytics

The analytics section shows four key numbers:

| Card | What It Means | Analogy |
|------|--------------|---------|
| **Total Revenue** | All money earned from bookings (FJD) | Your cash register total |
| **Total Guests** | How many people have booked | Foot traffic through the market |
| **Bookings** | Number of individual bookings made | Number of receipts printed |
| **Avg. Booking Value** | Average amount spent per booking | Average spend per customer |

### The Bar Chart

Below the cards, you'll see a **6-month bar chart** showing revenue trends.

- **Tall bars** = good months (lots of bookings)
- **Short bars** = quiet months (fewer bookings)
- **Hover over a bar** to see the exact amount

> **Analogy:** The bar chart is like a rain gauge for money. Each bar shows how much "rained in" that month. You want to see the bars getting taller over time!

### What to Watch For

- **Peak season (June–September):** Expect taller bars. This is whale season and dry season — tourist high time.
- **Off season (December–March):** Bars may be shorter. Consider running promotions.
- **Sudden drops:** If a month drops significantly, investigate — is an operator closed? Is the site down?

---

## 4. Managing Bookings

### Viewing Bookings

Each booking card in the Dashboard shows:
- Customer name
- Email address
- Booking date
- Number of participants
- Total fee paid
- Check-in status

### Checking In Guests

When a guest arrives at the activity:

1. Find their booking card on the Dashboard
2. Click the **✓ Check-In** button
3. The card will turn green with "Checked In" status

> **Analogy:** This is like a flight check-in desk. When the passenger arrives, you tick them off the list so everyone knows they've showed up.

### What If a Guest Doesn't Show?

- Leave their card as "not checked in"
- Contact them via the email shown on their card
- Follow your operator's no-show policy

---

## 5. Approving New Operators

### How Operators Apply

1. An operator visits **https://vualiku-xp.web.app/operator/apply**
2. They fill out a form with their business details, activities, and qualifications
3. The application appears in your Dashboard under **Operator Applications**

### Reviewing an Application

1. Scroll to the **Operator Applications** section at the bottom of your Dashboard
2. Click on an application to expand it
3. Review the details:
   - Business name and category
   - Region (where they operate)
   - Contact person and email
   - Description of their business
   - Activities they offer
   - Certifications and insurance
   - Why they want to join

### Approving or Rejecting

| Action | What Happens |
|--------|-------------|
| **Click Approve** ✅ | The operator receives a welcome email with login instructions. Their status is set to "approved." |
| **Click Reject** ❌ | The application is marked as rejected. No email is sent. |

> **Analogy:** This is like reviewing a rental application for a market stall. You read their proposal, check if they're a good fit, and either hand them the keys (approve) or politely decline (reject).

### Tips for Reviewing

- ✅ Check that they're in the Vanua Levu region
- ✅ Look for certifications and insurance
- ✅ Make sure their activities fit the eco-tourism focus
- ✅ Check if their website/social media is legitimate
- ❌ Reject if the business seems unrelated to tourism
- ❌ Reject if they can't provide basic safety information

---

## 6. Managing Reviews

Customer reviews appear on activity pages automatically. As an admin, you should:

- **Read reviews regularly** — they're your quality thermometer
- **Follow up on bad reviews** — contact the operator to discuss
- **Celebrate good reviews** — share them with operators as encouragement

> **Analogy:** Reviews are like customer feedback cards at a restaurant. Read them to know what's working and what needs improving.

---

## 7. Email Notifications

The system sends emails automatically through **Resend**:

| Email | When It's Sent | To Whom |
|-------|---------------|---------|
| Booking Confirmation | After a customer completes payment | Customer |
| Operator Welcome | When you approve an operator application | New operator |
| Admin Alert | When a new operator application is submitted | Admin team |

### If Emails Aren't Working

1. Check that the **RESEND_API_KEY** is set in `.env.local`
2. Verify at [resend.com](https://resend.com) → Dashboard → Logs
3. Free tier allows 100 emails/day — if you exceed this, upgrade or wait 24 hours

> **Analogy:** Resend is like your automatic mail clerk. It stuffs the envelopes and posts them for you. If it stops working, check that the clerk still has a valid pass (API key).

---

## 8. WhatsApp Notifications

When enabled, customers receive WhatsApp messages with their booking details.

### Current Status

The WhatsApp feature uses **Twilio**. It's controlled by a feature flag:

- `WHATSAPP_ENABLED=true` → WhatsApp messages are sent
- `WHATSAPP_ENABLED=false` → WhatsApp is disabled (emails still work)

### If WhatsApp Isn't Working

1. Check Twilio credentials in `.env.local`
2. Verify your Twilio account has credit
3. If using sandbox mode, the customer's number must be pre-registered

> **Analogy:** WhatsApp is like having a messenger boy who runs the confirmation to the customer's phone. If the messenger is off duty (disabled), the postal clerk (email) still handles it.

---

## 9. Search (Algolia)

The **Explore** page uses Algolia to let customers search for activities. 

### What's Indexed

All 22 activities across 7 operators are indexed with:
- Activity name, operator name, category
- Price, duration, time slot

### If Search Results Are Wrong or Missing

1. Go to [dashboard.algolia.com](https://dashboard.algolia.com)
2. Sign in and select your application
3. Click on the **masterEvents** index
4. You can browse, edit, or delete individual records
5. To re-sync all data, run: `node scripts/seed-algolia.mjs`

### Adding New Activities to Search

When a new operator adds activities, they need to be indexed in Algolia. Run the seed script again, or manually add records via the Algolia dashboard.

> **Analogy:** Algolia is like the index at the back of a book. It helps people find what they're looking for quickly. If you add a new chapter (activity), you need to update the index too.

---

## 10. Feature Flags

Feature flags are on/off switches for specific features. They live in the `.env.local` file:

| Flag | Current Value | What It Controls |
|------|--------------|-----------------|
| `WAIVERS_LIVE` | `false` | Digital waiver system (disabled until legal review) |
| `WHATSAPP_ENABLED` | `true` | WhatsApp booking notifications |

### How to Change a Flag

1. Open `.env.local` in the project folder
2. Change the value (e.g., `WAIVERS_LIVE=true`)
3. Restart the server: `npm run dev` (local) or redeploy to Firebase

> **Analogy:** Feature flags are like light switches on a wall. Flip them on or off depending on what you need. The wiring (code) is all done — you're just controlling the switch.

---

## 11. Routine Maintenance

### Daily Tasks

| Task | How | Time |
|------|-----|------|
| Check Dashboard for new bookings | Log in → Dashboard | 2 min |
| Review operator applications | Dashboard → Applications queue | 5 min |
| Scan for negative reviews | Browse activity pages | 5 min |

### Weekly Tasks

| Task | How | Time |
|------|-----|------|
| Check analytics trends | Dashboard → Analytics section | 5 min |
| Verify emails are sending | Resend dashboard → Logs | 2 min |
| Check WhatsApp delivery (if enabled) | Twilio dashboard → Logs | 2 min |

### Monthly Tasks

| Task | How | Time |
|------|-----|------|
| Review all operator profiles | Browse /directory | 10 min |
| Check Algolia search quality | Try 5–10 searches on /explore | 5 min |
| Review and update activity data | Compare booking-data.ts with operators | 15 min |
| Check Firebase usage & billing | Firebase Console → Usage tab | 5 min |

---

## 12. Common Scenarios

### "A customer says they didn't receive a confirmation email"

1. Check Resend dashboard ([resend.com](https://resend.com)) → Logs
2. Search for their email address
3. If the email was sent but not received, ask them to check spam/junk
4. If it wasn't sent, verify the `RESEND_API_KEY` is correct

### "An operator wants to change their activity prices"

1. The activity data lives in `src/lib/booking-data.ts`
2. Find the relevant `masterEvents` entry and update the `price` field
3. Re-run `node scripts/seed-algolia.mjs` to update search
4. Redeploy: `firebase deploy`

### "The website looks broken or won't load"

1. Check if Firebase Hosting is up: Firebase Console → Hosting
2. Try a hard refresh: `Ctrl + Shift + R`
3. Check the browser console for errors: `F12` → Console tab
4. If the problem persists, contact your technical team

### "A customer wants a refund"

1. Find their booking in the Dashboard
2. Contact the operator to confirm the cancellation
3. Process the refund through PayDock dashboard
4. Confirm with the customer via email

### "I want to add a new admin email"

1. Open `src/app/operator/dashboard/page.tsx`
2. Find the `ADMIN_EMAILS` array (near the top of the file)
3. Add the new email address to the list
4. Redeploy: `firebase deploy`

---

## 13. Admin Contact List

Keep this updated with your team's details:

| Role | Name | Email |
|------|------|-------|
| Lead Admin | — | ligarius22@gmail.com |
| Admin | — | dbucks3671@gmail.com |
| Admin | — | navareafarm@gmail.com |
| Admin | — | bulutani@yahoo.com |
| Technical Support | — | (your dev contact) |

---

*Vualiku XP — Community-Led Eco-Tourism, Vanua Levu, Fiji 🇫🇯*

*© 2026 Vualiku XP. All rights reserved.*
]]>
