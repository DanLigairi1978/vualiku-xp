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

/**
 * Replaces {{variables}} in a string with actual values
 */
export function parseTemplateString(template: string, variables: Record<string, string | number>): string {
    if (!template) return '';
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
        // Replace all occurrences of {{key}}
        result = result.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), String(value));
    }
    // Convert bold markdown to HTML strong tags
    result = result.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
    // Convert newlines to breaks
    result = result.replace(/\\n/g, '<br/>');
    return result;
}
