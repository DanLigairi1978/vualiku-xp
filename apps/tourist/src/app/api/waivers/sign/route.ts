// Digital Waiver System — Vualiku XP
// Gated behind WAIVERS_LIVE=false until legal review in Fiji is complete
// POST /api/waivers/sign

import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, getAdminStorage } from '@/lib/firebase/admin';
import { sendWaiverEmail } from '@/lib/email/resend';
import { FieldValue } from 'firebase-admin/firestore';
import PDFDocument from 'pdfkit';

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

        const db = getAdminFirestore();
        const storage = getAdminStorage();

        // CHECK 1: Save waiver to Firestore
        const waiverData = {
            bookingId,
            guestName: participantName,
            guestEmail: participantEmail,
            signedAt: FieldValue.serverTimestamp(),
            waiverVersion: '1.0',
            signatureData: signatureDataUrl,
            emergencyContact: {
                name: emergencyContactName || '',
                phone: emergencyContactPhone || '',
            },
            medicalConditions: medicalConditions || 'None',
            meta: {
                ip: request.headers.get('x-forwarded-for') || 'unknown',
                userAgent: request.headers.get('user-agent') || 'unknown',
            }
        };

        await db.collection('waivers').doc(bookingId).set(waiverData);

        // CHECK 2: Generate PDF
        const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const chunks: any[] = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Header
            doc.fontSize(20).text('Vualiku XP Activity Waiver', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Booking ID: ${bookingId}`);
            doc.text(`Guest Name: ${participantName}`);
            doc.text(`Guest Email: ${participantEmail}`);
            doc.text(`Date Signed: ${new Date().toLocaleDateString()}`);
            doc.moveDown();

            // Legal Text
            doc.fontSize(14).text('Release of Liability and Assumption of Risk', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(10).text(
                'I, the undersigned, acknowledge that participation in Vualiku XP activities involves certain risks. By signing this document, I voluntarily assume all such risks and release Vualiku XP and its operators from any liability for injury or damage arising from my participation. I confirm that I am in good health and have disclosed all relevant medical conditions.',
                { align: 'justify' }
            );

            if (medicalConditions) {
                doc.moveDown();
                doc.text(`Medical Conditions: ${medicalConditions}`);
            }

            // Signature
            if (signatureDataUrl) {
                doc.moveDown();
                doc.text('Signature:');
                try {
                    // Extract base64 content
                    const base64Data = signatureDataUrl.split(';base64,').pop() || '';
                    const imgBuffer = Buffer.from(base64Data, 'base64');
                    doc.image(imgBuffer, { width: 200 });
                } catch (e) {
                    doc.text('[Signature Image Error]');
                }
            }

            doc.end();
        });

        // Save PDF to Firebase Storage
        const bucket = storage.bucket();
        const filePath = `waivers/${bookingId}/signed-waiver.pdf`;
        const file = bucket.file(filePath);

        await file.save(pdfBuffer, {
            metadata: {
                contentType: 'application/pdf',
                metadata: {
                    bookingId,
                    guestName: participantName
                }
            }
        });

        // CHECK 3: Email the PDF
        await sendWaiverEmail({
            customerName: participantName,
            customerEmail: participantEmail,
            bookingId,
            pdfBuffer
        });

        return NextResponse.json({
            success: true,
            message: 'Waiver signed successfully. A copy has been emailed to you.',
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
