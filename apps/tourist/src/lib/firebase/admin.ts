import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp() {
    if (getApps().length === 0) {
        // If service account credentials are available (Vercel production), use them
        if (process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
            const serviceAccount: ServiceAccount = {
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'vualiku-xp',
                clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
            };
            return initializeApp({ credential: cert(serviceAccount) });
        }

        // Fallback: projectId only (works in local dev with ADC / emulator)
        return initializeApp({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'vualiku-xp',
        });
    }
    return getApps()[0];
}

export function getAdminFirestore() {
    getAdminApp();
    return getFirestore();
}
