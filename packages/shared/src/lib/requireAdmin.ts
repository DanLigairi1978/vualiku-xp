import { adminAuth, adminDb } from './firebase/admin';

export async function requireAdmin(request: Request) {
    const token = request.headers.get('Authorization')?.split('Bearer ')[1];

    if (!token) {
        throw new Error('Unauthorized');
    }

    try {
        const decoded = await adminAuth.verifyIdToken(token);
        const userDoc = await adminDb.collection('users').doc(decoded.uid).get();

        // Check for admin role in Firestore document
        const userData = userDoc.data();
        if (!userData || userData.role !== 'admin') {
            throw new Error('Forbidden: Admin access required');
        }

        return decoded;
    } catch (error) {
        console.error('[requireAdmin] Auth error:', error);
        throw error;
    }
}
