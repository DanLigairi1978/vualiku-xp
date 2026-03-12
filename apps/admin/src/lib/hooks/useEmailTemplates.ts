import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@danligairi1978/shared';

export type TemplateKey =
    | 'bookingConfirmation'
    | 'tripReminder'
    | 'reviewRequest'
    | 'bookingCancellation'
    | 'operatorWelcome';

export interface EmailTemplateConfig {
    subject: string;
    headline: string;
    subheadline: string;
    greeting: string;
    bodyIntro: string;
    callToAction?: string;
    footerText: string;
}

export const DEFAULT_TEMPLATES: Record<TemplateKey, EmailTemplateConfig> = {
    bookingConfirmation: {
        subject: "🌿 Booking Confirmed — {{eventName}}",
        headline: "Booking Confirmed ✓",
        subheadline: "Vualiku XP — Authentic Fijian Adventures",
        greeting: "Bula, {{customerName}}! 🌺",
        bodyIntro: "Your adventure has been booked and payment received. Here's your confirmation:",
        callToAction: "View Your Booking",
        footerText: "Need help? Reply to this email or WhatsApp us.\\nVinaka vakalevu — Vualiku XP Team 🌿"
    },
    tripReminder: {
        subject: "⏰ Your Adventure is Tomorrow! — {{eventName}}",
        headline: "Tomorrow's the Day! 🎉",
        subheadline: "Your Vualiku XP adventure is just 24 hours away",
        greeting: "Bula, {{customerName}}!",
        bodyIntro: "Just a friendly reminder — your adventure is happening tomorrow:",
        footerText: "Vinaka vakalevu — Vualiku XP Team 🌿"
    },
    reviewRequest: {
        subject: "⭐ How was your adventure? — {{eventName}}",
        headline: "How Was Your Adventure?",
        subheadline: "Your feedback helps the {{operatorName}} community",
        greeting: "Bula, {{customerName}}! 🌺",
        bodyIntro: "We hope you had an amazing time on **{{eventName}}** with {{operatorName}}. Your review helps local operators improve and helps other travellers discover authentic Fijian experiences.",
        callToAction: "Leave a Review ⭐",
        footerText: "Vinaka vakalevu — Vualiku XP Team 🌿"
    },
    bookingCancellation: {
        subject: "Booking Cancelled — {{eventName}}",
        headline: "Booking Cancelled",
        subheadline: "We're sorry to see you go",
        greeting: "Bula, {{customerName}},",
        bodyIntro: "Your booking for **{{eventName}}** (ID: {{bookingId}}) has been cancelled.",
        callToAction: "Browse More Adventures",
        footerText: "Vinaka vakalevu — Vualiku XP Team 🌿"
    },
    operatorWelcome: {
        subject: "🎉 Welcome to Vualiku XP, {{operatorName}}!",
        headline: "Welcome to the Family! 🌿",
        subheadline: "Your operator account has been approved",
        greeting: "Bula, {{operatorName}}!",
        bodyIntro: "Great news! Your application to join Vualiku XP as an experience operator has been approved. You can now log in to the Operator Portal to manage your profile, team, and bookings.",
        callToAction: "Access Operator Portal",
        footerText: "Vinaka vakalevu — Vualiku XP Team 🌿"
    }
};

export function useEmailTemplates() {
    const [templates, setTemplates] = useState<Record<TemplateKey, EmailTemplateConfig>>(DEFAULT_TEMPLATES);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const docRef = doc(db, 'platformConfig', 'emailTemplates');

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as Record<TemplateKey, EmailTemplateConfig>;
                // Merge with defaults to ensure all keys exist
                setTemplates({
                    ...DEFAULT_TEMPLATES,
                    ...data
                });
            } else {
                setTemplates(DEFAULT_TEMPLATES);
            }
            setLoading(false);
        }, (err) => {
            console.error("Error fetching email templates:", err);
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const updateTemplate = async (key: TemplateKey, config: EmailTemplateConfig) => {
        try {
            const docRef = doc(db, 'platformConfig', 'emailTemplates');

            // Fetch current to merge safely
            const currentSnap = await getDoc(docRef);
            let currentData = {};
            if (currentSnap.exists()) {
                currentData = currentSnap.data();
            }

            await setDoc(docRef, {
                ...currentData,
                [key]: config
            }, { merge: true });

            return true;
        } catch (err: any) {
            console.error("Failed to update template:", err);
            throw err;
        }
    };

    return { templates, loading, error, updateTemplate };
}
