/**
 * WhatsApp Booking Bot Logic
 * Handles the state machine for conversational bookings
 */

import { masterEvents, standardSlots, tourCompanies, db } from '@danligairi1978/shared';
import { doc, getDoc } from 'firebase/firestore';

export interface BotState {
    step: 'START' | 'SEARCH' | 'DATE' | 'CONFIRM';
    data: {
        operatorId?: string;
        eventId?: string;
        date?: string;
        pax?: number;
    };
}

// In-memory state store (for demo purposes, usually Redis/Firestore)
const sessionStore = new Map<string, BotState>();

async function getWhatsAppConfig() {
    try {
        const snap = await getDoc(doc(db, 'platformConfig', 'whatsapp'));
        if (snap.exists()) {
            return snap.data();
        }
    } catch (e) {
        console.error("Failed to fetch WhatsApp config:", e);
    }
    return null;
}

export async function handleWhatsAppMessage(from: string, body: string): Promise<string> {
    const config = await getWhatsAppConfig();

    // Check if bot is active
    if (config && config.isActive === false) {
        return ""; // Silently ignore or return specific "Bot Disabled" message if needed
    }

    const templates = config?.templates || {};
    const resetCommands = templates.RESET_COMMANDS || ['hi', 'bula', 'reset'];

    const text = body.trim().toLowerCase();
    let state = sessionStore.get(from) || { step: 'START', data: {} };

    // Reset command
    if (resetCommands.includes(text)) {
        state = { step: 'START', data: {} };
    }

    let response = "";

    switch (state.step) {
        case 'START':
            const startTemplate = templates.START || "🌿 *Bula from Vualiku XP!*\nI can help you find and book an adventure in Vanua Levu.\n\nReply with a number to choose an operator:\n{{operators}}\n\nType *'Hi'* to restart anytime.";
            const operatorsList = tourCompanies.map((c, i) => `${i + 1}. ${c.name}`).join('\n');

            response = startTemplate.replace('{{operators}}', operatorsList);
            state.step = 'SEARCH';
            break;

        case 'SEARCH':
            const opIndex = parseInt(text) - 1;
            if (!isNaN(opIndex) && tourCompanies[opIndex]) {
                const operator = tourCompanies[opIndex];
                state.data.operatorId = operator.id;
                const events = masterEvents.filter(e => e.operatorId === operator.id);

                const searchTemplate = templates.SEARCH || "📍 *{{operatorName}}*\nExcellent choice! Which activity interests you?\n\n{{activities}}";
                const activitiesList = events.map((e, i) => `${i + 1}. ${e.name} (FJD $${e.price})`).join('\n');

                response = searchTemplate
                    .replace('{{operatorName}}', operator.name)
                    .replace('{{activities}}', activitiesList);
                state.step = 'DATE';
            } else {
                response = templates.ERROR_STEP || "Sorry, I didn't recognize that selection. Please choose an option by number:";
            }
            break;

        case 'DATE':
            const evIndex = parseInt(text) - 1;
            const opEvents = masterEvents.filter(e => e.operatorId === state.data.operatorId);

            if (!isNaN(evIndex) && opEvents[evIndex]) {
                state.data.eventId = opEvents[evIndex].id;
                const dateTemplate = templates.DATE || "🙌 *{{activityName}}*\nWhen would you like to go?\n\nPlease reply with a date like *YYYY-MM-DD* (e.g., 2024-10-15):";

                response = dateTemplate.replace('{{activityName}}', opEvents[evIndex].name);
                state.step = 'CONFIRM';
            } else {
                response = templates.ERROR_STEP || "Please select an activity by number:";
            }
            break;

        case 'CONFIRM':
            if (isValidDate(text)) {
                state.data.date = text;
                const event = masterEvents.find(e => e.id === state.data.eventId);

                const confirmTemplate = templates.CONFIRM || "✅ *Booking Request Summary*\n\n📦 Adventure: {{activityName}}\n📅 Date: {{date}}\n📍 Location: Vanua Levu\n\nTo finalize this booking and pay securely, please visit our portal:\n👉 {{bookingUrl}}\n\nVinaka vakalevu! 🌺";
                const bookingUrl = `vualiku-xp.web.app/booking?operator=${state.data.operatorId}&event=${state.data.eventId}&date=${state.data.date}`;

                response = confirmTemplate
                    .replace('{{activityName}}', event?.name || 'Adventure')
                    .replace('{{date}}', state.data.date)
                    .replace('{{bookingUrl}}', bookingUrl);

                // Final state - clear or wait for next Hi
                state.step = 'START';
            } else {
                response = templates.ERROR_DATE || "That doesn't look like a valid date. Please use *YYYY-MM-DD* format:";
            }
            break;
    }

    sessionStore.set(from, state);
    return response;
}

function isValidDate(dateString: string) {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx)) return false;  // Invalid format
    const d = new Date(dateString);
    const dNum = d.getTime();
    if (!dNum && dNum !== 0) return false; // NaN value, Invalid date
    return d.toISOString().slice(0, 10) === dateString;
}
