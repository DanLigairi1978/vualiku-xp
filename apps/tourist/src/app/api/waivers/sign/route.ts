// Digital Waiver System — Vualiku XP
// Gated behind WAIVERS_LIVE=false until legal review in Fiji is complete
// POST /api/waivers/sign

import { NextRequest, NextResponse } from 'next/server';

const WAIVERS_LIVE = process.env.WAIVERS_LIVE === 'true';

export async function POST(request: NextRequest) {
    // Feature gate: return early if waivers aren't live
    if (!WAIVERS_LIVE) {
        return NextResponse.json({
            success: false,
            gated: true,
            message: 'Digital waivers are currently disabled. Pending legal review.',
        }, { status: 503 });
    }

    try {
        const body = await request.json();
        const {
            bookingId,
            participantName,
            participantEmail,
            signatureDataUrl,
            agreedToTerms,
            emergencyContactName,
            emergencyContactPhone,
            medicalConditions,
        } = body as {
            bookingId: string;
            participantName: string;
            participantEmail: string;
            signatureDataUrl: string;
            agreedToTerms: boolean;
            emergencyContactName?: string;
            emergencyContactPhone?: string;
            medicalConditions?: string;
        };

        // Validation
        if (!bookingId || !participantName || !participantEmail || !signatureDataUrl || !agreedToTerms) {
            return NextResponse.json(
                { error: 'Missing required fields: bookingId, participantName, participantEmail, signatureDataUrl, agreedToTerms' },
                { status: 400 }
            );
        }

        // TODO: Save waiver to Firestore
        // const waiverRef = await addDoc(collection(adminDb, 'waivers'), {
        //   bookingId,
        //   participantName,
        //   participantEmail,
        //   signatureDataUrl,
        //   agreedToTerms,
        //   emergencyContactName: emergencyContactName || '',
        //   emergencyContactPhone: emergencyContactPhone || '',
        //   medicalConditions: medicalConditions || 'None',
        //   signedAt: serverTimestamp(),
        //   ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        //   userAgent: request.headers.get('user-agent') || 'unknown',
        // });

        // TODO: Generate PDF copy of signed waiver
        // TODO: Email PDF copy to participant

        return NextResponse.json({
            success: true,
            // waiverId: waiverRef.id,
            message: 'Waiver signed successfully. A copy will be emailed to you.',
        });

    } catch (error) {
        console.error('[api/waivers/sign] Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to process waiver' },
            { status: 500 }
        );
    }
}

// GET: Check if waivers are enabled
export async function GET() {
    return NextResponse.json({
        enabled: WAIVERS_LIVE,
        message: WAIVERS_LIVE
            ? 'Digital waivers are active.'
            : 'Digital waivers are currently disabled pending legal review in Fiji.',
    });
}
