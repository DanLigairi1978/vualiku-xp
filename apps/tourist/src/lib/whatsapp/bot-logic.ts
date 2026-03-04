/**
 * WhatsApp Booking Bot Logic
 * Handles the state machine for conversational bookings
 */

import { masterEvents, standardSlots, tourCompanies } from '@vualiku/shared';

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

export async function handleWhatsAppMessage(from: string, body: string): Promise<string> {
    const text = body.trim().toLowerCase();
    let state = sessionStore.get(from) || { step: 'START', data: {} };

    // Reset command
    if (text === 'reset' || text === 'hi' || text === 'bula') {
        state = { step: 'START', data: {} };
    }

    let response = "";

    switch (state.step) {
        case 'START':
            response = "🌿 *Bula from Vualiku XP!*\n" +
                "I can help you find and book an adventure in Vanua Levu.\n\n" +
                "Reply with a number to choose an operator:\n" +
                tourCompanies.map((c, i) => `${i + 1}. ${c.name}`).join('\n') +
                "\n\nType *'Hi'* to restart anytime.";
            state.step = 'SEARCH';
            break;

        case 'SEARCH':
            const opIndex = parseInt(text) - 1;
            if (!isNaN(opIndex) && tourCompanies[opIndex]) {
                const operator = tourCompanies[opIndex];
                state.data.operatorId = operator.id;
                const events = masterEvents.filter(e => e.operatorId === operator.id);

                response = `📍 *${operator.name}*\nExcellent choice! Which activity interests you?\n\n` +
                    events.map((e, i) => `${i + 1}. ${e.name} (FJD $${e.price})`).join('\n');
                state.step = 'DATE';
            } else {
                response = "Sorry, I didn't recognize that number. Please choose an operator (1, 2, etc.):";
            }
            break;

        case 'DATE':
            const evIndex = parseInt(text) - 1;
            const opEvents = masterEvents.filter(e => e.operatorId === state.data.operatorId);

            if (!isNaN(evIndex) && opEvents[evIndex]) {
                state.data.eventId = opEvents[evIndex].id;
                response = `🙌 *${opEvents[evIndex].name}*\nWhen would you like to go?\n\nPlease reply with a date like *YYYY-MM-DD* (e.g., 2024-10-15):`;
                state.step = 'CONFIRM';
            } else {
                response = "Please select an activity by number:";
            }
            break;

        case 'CONFIRM':
            if (isValidDate(text)) {
                state.data.date = text;
                const event = masterEvents.find(e => e.id === state.data.eventId);

                response = `✅ *Booking Request Summary*\n\n` +
                    `📦 Adventure: ${event?.name}\n` +
                    `📅 Date: ${state.data.date}\n` +
                    `📍 Location: Vanua Levu\n\n` +
                    `To finalize this booking and pay securely, please visit our portal:\n` +
                    `👉 vualiku-xp.web.app/booking?operator=${state.data.operatorId}&event=${state.data.eventId}&date=${state.data.date}\n\n` +
                    `Vinaka vakalevu! 🌺`;

                // Final state - clear or wait for next Hi
                state.step = 'START';
            } else {
                response = "That doesn't look like a valid date. Please use *YYYY-MM-DD* format:";
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
