import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export function getAdminFirestore() {
    if (getApps().length === 0) {
        try {
            // Note: Since we are using this across next.js, the project ID is usually enough
            // for development if we rely on application default credentials, or we can just 
            // pass projectId. Vercel automatically injects service accounts if configured.
            initializeApp({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'vualiku-xp',
            });
        } catch (e) {
            console.error('Failed to initialize Firebase Admin', e);
        }
    }
    return getFirestore();
}
