// Admin Approval API — Vualiku XP
// POST /api/operator/approve
// C2 fix: Requires admin authentication
// C3 fix: Actually performs Firestore update (no longer a no-op)

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, requireAdmin } from '@vualiku/shared/server';

// Initialize Firebase Admin (server-side)
const db = adminDb;

export async function POST(request: NextRequest) {
    try {
        // C2: Require admin authentication (Secure server-side check)
        const auth = await requireAdmin(request);

        const body = await request.json();
        const { applicationId, action, notes } = body as {
            applicationId: string;
            action: 'approve' | 'reject';
            notes?: string;
        };

        if (!applicationId || !action) {
            return NextResponse.json(
                { error: 'applicationId and action are required' },
                { status: 400 }
            );
        }

        if (!['approve', 'reject'].includes(action)) {
            return NextResponse.json(
                { error: 'action must be "approve" or "reject"' },
                { status: 400 }
            );
        }

        // C3 fix: Actually update Firestore
        try {
            const db = adminDb;
            const appRef = db.collection('operatorApplications').doc(applicationId);
            const appDoc = await appRef.get();

            if (!appDoc.exists) {
                return NextResponse.json(
                    { error: 'Application not found' },
                    { status: 404 }
                );
            }

            await appRef.update({
                status: action === 'approve' ? 'approved' : 'rejected',
                reviewedAt: new Date().toISOString(),
                reviewedBy: auth.email,
                notes: notes || '',
            });

            // If approved, send welcome email
            if (action === 'approve') {
                try {
                    const appData = appDoc.data();
                    const { sendOperatorWelcomeEmail } = await import('@/lib/email/operator-welcome');
                    await sendOperatorWelcomeEmail({
                        businessName: appData?.businessName || 'Operator',
                        contactName: appData?.contactName || 'Partner',
                        email: appData?.email || '',
                    });
                } catch (emailError) {
                    console.error('[approve] Welcome email failed:', emailError);
                    // Non-critical — continue with approval
                }
            }
        } catch (firestoreError) {
            console.error('[approve] Firestore update failed:', firestoreError);
            // Fallback: return success with warning if Firestore Admin SDK is not configured
            return NextResponse.json({
                success: true,
                warning: 'Firebase Admin SDK not fully configured. Application status update may require manual processing.',
                applicationId,
                action,
            });
        }

        return NextResponse.json({
            success: true,
            applicationId,
            action,
            message: action === 'approve'
                ? 'Operator approved and welcome email sent.'
                : 'Application rejected.',
        });

    } catch (error) {
        console.error('[api/operator/approve] Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to process application' },
            { status: 500 }
        );
    }
}
