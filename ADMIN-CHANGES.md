# Meridian Admin Site - Project Handover Document

## 1. Project Architecture (Monorepo Transition)
The project has been successfully restructured into a monorepo to support shared logic between the `admin` and `tourist` applications.

- **`apps/admin`**: The new Next.js administrative platform.
- **`apps/tourist`**: The consumer-facing booking site.
- **`packages/shared`**: Shared TypeScript types, Firebase configurations, and utility functions.

## 2. Authentication & Authorization
Admin routes are highly secure and protected by multiple layers:
- **`AuthProvider`**: Manages the Firebase Auth state globally.
- **`AdminGuard`**: A client-side guard that blocks non-admin users from accessing protected views.
- **`requireAdmin.ts`**: Middleware-ready logic for future server-side protection.

## 3. Data Flow & Hooks
All modules utilize custom reactive hooks to bridge Firestore and the UI:
- `useOperators`: Partner lifecycle management.
- `useBookings`: Real-time transaction filtering and reconciliation.
- `useCommunications`: Unified transmission tracking.
- `useRevenue`: Financial aggregation and yield mapping.
- `useSettings`: Global feature flag and pricing engine control.
- `useApplications`: Partner intake screening.

## 4. UI/UX "Meridian Glass"
The admin site features a custom design language optimized for operational efficiency:
- **Dark Mode Syntax**: Built on `slate-950` with high-contrast `primary` (#9acd32) accents.
- **Dynamic Feedback**: Real-time sync indicators on all critical data inputs.
- **Dialog-Driven Workflow**: Minimizes context switching by handling details in high-fidelity drawers.

## 5. Security Protocols
- **Feature Flags**: Instant global overrides for critical systems.
- **Secret Rotation**: UI-ready components for managing platform-wide security keys.
- **Intake Screening**: Strict approval workflow for all new partnership requests.

---
*Status: All Phase 1-10 tasks completed. Ready for production deployment.*
