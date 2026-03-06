# Custom Domain Deployment Guide: Hostinger to Firebase

This guide outlines the complete process of buying a domain from Hostinger, setting up professional emails, and pointing the domain to your Firebase-hosted Vualiku XP Next.js application.

## The Architecture: Separation of Concerns
You do not need to move your database or application code to Hostinger. The modern web allows us to split responsibilities seamlessly:

1. **Hostinger (The Registrar):** Manages the domain name (the address book of the internet) and handles your professional email inboxes (e.g., `@vualikuxp.com`).
2. **Firebase (The Host & Backend):** Handles the raw server computing power, the deployed Next.js website, the Firestore Database, and User Authentication.

---

## Step-by-Step Integration Guide

### Phase 1: Purchase & Email Setup on Hostinger
1. **Buy the Domain:** Go to [Hostinger.com](https://www.hostinger.com/) and purchase your desired custom domain (e.g., `vualikuxp.com`).
2. **Set Up Professional Emails:** If you purchased an email hosting package through Hostinger, follow their setup wizard to create your professional inboxes. Hostinger will manage these incoming/outgoing emails completely on their own dedicated mail servers, entirely independent of your website code.

### Phase 2: Link Firebase to the Custom Domain
1. Log in to your [Firebase Console](https://console.firebase.google.com/).
2. Select the **`vualiku-xp`** project.
3. On the left sidebar menu, click on **Hosting** (under the "Build" section).
4. Click the **"Add Custom Domain"** button.
5. Enter your newly purchased domain name (e.g., `vualikuxp.com` or `www.vualikuxp.com`) into the wizard.
6. Firebase will now provide you with a set of specific **DNS Records** (usually a couple of `A` records and a `TXT` record). Keep this window open or copy the values.

### Phase 3: Update DNS Records on Hostinger
1. Go back to your **Hostinger Dashboard**.
2. Navigate to the **DNS / Nameservers management** page for your new domain.
3. **Delete Default Records (Optional but Recommended):** You may see default "A" records or "CNAME" records pointing to Hostinger's parking pages. You will want to delete these so they don't conflict with Firebase. *(Do not delete any "MX" records, as those are what make your Hostinger emails work!)*
4. **Add the Firebase Records:** 
   - Look at the records Firebase just gave you. 
   - If Firebase says "Add an `A` record with IP `199.36.158.100`", go to Hostinger, create a new record of type "A", set the Target/Value to `199.36.158.100`, and set the Host/Name to `@` (which stands for the root domain).
   - Repeat this exact process for any remaining `A` or `TXT` records Firebase requested.
5. **Save Changes:** Ensure all records are saved in your Hostinger dashboard.

### Phase 4: Wait for DNS Propagation & Auto-SSL
- **DNS Propagation:** It can take anywhere from a few minutes to 24 hours for the internet's global DNS network to update. Be patient during this step.
- **Automatic SSL Encryption:** Once Firebase detects that Hostinger is successfully routing traffic to it, Firebase will automatically provision and attach a free, auto-renewing SSL certificate to your domain. This ensures your visitors see the secure padlock icon (`https://`) required for booking sites.
- **Verification:** Once the setup is complete, anyone typing `vualikuxp.com` into their browser will be instantly, safely routed to your Next.js application running on Firebase's enterprise servers.

---
*Created for Vualiku XP*
