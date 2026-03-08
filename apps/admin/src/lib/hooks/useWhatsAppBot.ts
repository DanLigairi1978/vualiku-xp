'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@vualiku/shared';

export interface WhatsAppBotConfig {
    isActive: boolean;
    templates: {
        START: string;
        SEARCH: string;
        DATE: string;
        CONFIRM: string;
        ERROR_STEP: string;
        ERROR_DATE: string;
        RESET_COMMANDS: string[]; // e.g. ["hi", "bula", "reset"]
    };
    updatedAt?: any;
}

const DEFAULT_WHATSAPP_CONFIG: WhatsAppBotConfig = {
    isActive: true,
    templates: {
        START: "🌿 *Bula from Vualiku XP!*\nI can help you find and book an adventure in Vanua Levu.\n\nReply with a number to choose an operator:\n{{operators}}\n\nType *'Hi'* to restart anytime.",
        SEARCH: "📍 *{{operatorName}}*\nExcellent choice! Which activity interests you?\n\n{{activities}}",
        DATE: "🙌 *{{activityName}}*\nWhen would you like to go?\n\nPlease reply with a date like *YYYY-MM-DD* (e.g., 2024-10-15):",
        CONFIRM: "✅ *Booking Request Summary*\n\n📦 Adventure: {{activityName}}\n📅 Date: {{date}}\n📍 Location: Vanua Levu\n\nTo finalize this booking and pay securely, please visit our portal:\n👉 {{bookingUrl}}\n\nVinaka vakalevu! 🌺",
        ERROR_STEP: "Sorry, I didn't recognize that selection. Please choose an option by number:",
        ERROR_DATE: "That doesn't look like a valid date. Please use *YYYY-MM-DD* format (e.g., 2024-10-15):",
        RESET_COMMANDS: ["hi", "bula", "reset"],
    },
};

export function useWhatsAppBot() {
    const [config, setConfig] = useState<WhatsAppBotConfig | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, 'platformConfig', 'whatsapp'), (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                const merged: WhatsAppBotConfig = {
                    isActive: data.isActive ?? DEFAULT_WHATSAPP_CONFIG.isActive,
                    templates: { ...DEFAULT_WHATSAPP_CONFIG.templates, ...data.templates },
                    updatedAt: data.updatedAt,
                };
                setConfig(merged);
            } else {
                setDoc(doc(db, 'platformConfig', 'whatsapp'), {
                    ...DEFAULT_WHATSAPP_CONFIG,
                    updatedAt: serverTimestamp(),
                });
                setConfig(DEFAULT_WHATSAPP_CONFIG);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const updateWhatsAppConfig = async (partial: Partial<WhatsAppBotConfig>) => {
        return await updateDoc(doc(db, 'platformConfig', 'whatsapp'), {
            ...partial,
            updatedAt: serverTimestamp(),
        });
    };

    return { config, loading, updateWhatsAppConfig, DEFAULT_WHATSAPP_CONFIG };
}
