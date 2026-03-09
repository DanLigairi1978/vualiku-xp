/* eslint-disable @typescript-eslint/no-require-imports */

// @ts-ignore
const jsPDF = typeof window !== 'undefined' ? require('jspdf').jsPDF : null
import { BasketItem } from '@/context/BasketContext';
import { format, parseISO } from 'date-fns';

interface OriginData {
    id: string;
    label: string;
    category: string;
}

export const generatePdfItinerary = async (
    events: BasketItem[],
    origin: OriginData | undefined,
    grandTotal: number,
    isDraft: boolean = false
) => {
    // Initialize A4 PDF
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    let cursorY = margin;

    // 1. Watermark Layer (if draft)
    if (isDraft) {
        doc.setTextColor(230, 230, 230);
        doc.setFontSize(80);
        doc.setFont('helvetica', 'bold');

        // Rotate and map across the page
        doc.text("DRAFT ITINERARY", pageWidth / 2, pageHeight / 2, {
            angle: 45,
            align: 'center'
        });
        // Reset
        doc.setTextColor(0, 0, 0);
    }

    // 2. Header: Logo & Branding
    doc.setFillColor(20, 83, 45); // Tailwind green-900 (Vualiku Primaryish)
    doc.rect(0, 0, pageWidth, 50, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('times', 'bold');
    doc.text("VUALIKU XP", margin, 35);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(isDraft ? "Booking Pending - Draft Quote" : "Confirmed Itinerary Receipt", pageWidth - margin, 32, { align: 'right' });

    cursorY += 40;

    // 3. Hero Placeholder
    doc.setFillColor(230, 240, 235);
    doc.rect(margin, cursorY, pageWidth - (margin * 2), 150, 'F');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text("[ Northern Fiji Landscape Visual ]", pageWidth / 2, cursorY + 75, { align: 'center' });

    cursorY += 180;

    // 4. Map Integration Placeholder
    // Drawing a map footprint box
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, cursorY, pageWidth - (margin * 2), 100, 'F');
    doc.setDrawColor(20, 83, 45);
    doc.rect(margin, cursorY, pageWidth - (margin * 2), 100, 'D'); // Border
    doc.text("[ Dynamic Route Google Terrain Map ]", pageWidth / 2, cursorY + 50, { align: 'center' });

    cursorY += 130;

    // 5. Timeline Nodes
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text("Travel Timeline", margin, cursorY);

    cursorY += 30;

    // Arrival Node
    doc.setFontSize(12);
    if (origin) {
        doc.setFont('helvetica', 'bold');
        doc.text(`Origin Anchor: ${origin.label} (${origin.category})`, margin, cursorY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text("Start of journey.", margin, cursorY + 15);
        cursorY += 40;
    }

    // Draw Vertical Line for Timeline
    const lineX = margin + 10;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(2);

    doc.setTextColor(0, 0, 0);
    events.forEach((evt, idx) => {
        // Prevent page overflow
        if (cursorY > pageHeight - 150) {
            doc.addPage();
            cursorY = margin;
        }

        // Timeline dot
        doc.setFillColor(20, 83, 45);
        doc.circle(lineX, cursorY - 4, 4, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(`${idx + 1}. ${evt.eventName}`, margin + 30, cursorY);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);

        const dateStr = format(parseISO(evt.date), "EEEE, MMM do, yyyy");
        doc.text(`${dateStr} | ${evt.timeSlot} | ${evt.operatorName}`, margin + 30, cursorY + 15);

        // Pricing Subline
        doc.setTextColor(20, 83, 45);
        doc.text(`${evt.pax} Participants @ $${evt.pricePerPax} = $${evt.totalPrice}`, margin + 30, cursorY + 30);

        doc.setTextColor(0, 0, 0);
        cursorY += 60;
    });

    // 6. Final Quotation / Pricing Block
    if (cursorY > pageHeight - 200) {
        doc.addPage();
        cursorY = margin;
    }

    cursorY += 20;
    doc.setDrawColor(20, 83, 45);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);

    cursorY += 20;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("Order Summary", margin, cursorY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    const subtotal = events.reduce((s, i) => s + i.totalPrice, 0);
    const tax = subtotal * 0.15;

    cursorY += 25;
    doc.text(`Subtotal (${events.length} Events):`, margin, cursorY);
    doc.text(`$${subtotal.toFixed(2)}`, pageWidth - margin, cursorY, { align: 'right' });

    cursorY += 20;
    doc.text("Taxes & Fees (15% Inc. Insurance):", margin, cursorY);
    doc.text(`$${tax.toFixed(2)}`, pageWidth - margin, cursorY, { align: 'right' });

    cursorY += 30;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text("Grand Total:", margin, cursorY);
    doc.text(`$${grandTotal.toFixed(2)}`, pageWidth - margin, cursorY, { align: 'right' });

    // 7. Footer: QR & Copyright
    const footerY = pageHeight - 60;
    doc.setFillColor(245, 245, 245);
    doc.rect(0, footerY, pageWidth, 60, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text("VualikuXP, a Meridian Solutions digital assistant, Copyright 2026.", margin, footerY + 20);
    doc.text("Scan the QR code below or visit vualikuxp.com to resume this booking.", margin, footerY + 35);

    // Fake QR Code box
    doc.setFillColor(0, 0, 0);
    doc.rect(pageWidth - margin - 40, footerY + 10, 40, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.text("QR", pageWidth - margin - 20, footerY + 32, { align: 'center' });

    // Output
    const fileName = `VualikuXP_${isDraft ? 'Draft_' : ''}Itinerary_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`;
    doc.save(fileName);
};
