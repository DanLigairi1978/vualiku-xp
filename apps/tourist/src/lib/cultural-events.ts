/**
 * Vanua Levu & Fiji Cultural Calendar
 * List of significant local holidays and events impacting community activity.
 */

export interface CulturalEvent {
    id: string;
    name: string;
    date: string; // MM-DD format for annual events
    type: 'Holiday' | 'Festival' | 'Community' | 'Anniversary';
    description: string;
}

export const CULTURAL_EVENTS: CulturalEvent[] = [
    {
        id: 'new-year',
        name: 'New Year\'s Day',
        date: '01-01',
        type: 'Holiday',
        description: 'Nationwide celebrations. Operators may have limited capacity.'
    },
    {
        id: 'prophet-bday',
        name: 'Prophet Mohammed\'s Birthday',
        date: '09-16', // 2024 date approx
        type: 'Holiday',
        description: 'Significant religious holiday in Fiji.'
    },
    {
        id: 'fiji-day',
        name: 'Fiji Day',
        date: '10-10',
        type: 'Holiday',
        description: 'Independence Day. High community activity and local celebrations.'
    },
    {
        id: 'hibiscus-fest',
        name: 'Hibiscus Festival',
        date: '08-15',
        type: 'Festival',
        description: 'The "Mother of Festivals". Expect high traffic and vibrant street life.'
    },
    {
        id: 'bilo-anniversary',
        name: 'Bilo Vualiku Anniversary',
        date: '11-20',
        type: 'Anniversary',
        description: 'Celebrating local community achievements. Special rates may apply.'
    },
    {
        id: 'savusavu-music-regatta', // Changed ID to avoid conflict
        name: 'Savusavu Music & Regatta',
        date: '06-12',
        type: 'Festival',
        description: 'Sailing and music event in the Hidden Paradise. Bookings fill up fast.'
    },
    {
        id: 'diwali',
        name: 'Diwali',
        date: '11-01', // 2024 date approx
        type: 'Holiday',
        description: 'Festival of Lights. Very high demand for evening events.'
    },
    {
        id: 'savusavu-regatta',
        name: 'Savusavu Regatta Week',
        date: '09-20',
        type: 'Festival',
        description: 'Major sailing and social event in Vanua Levu.'
    },
    {
        id: 'christmas',
        name: 'Christmas Day',
        date: '12-25',
        type: 'Holiday',
        description: 'Family gatherings. Most community operators closed.'
    },
    {
        id: 'boxing-day',
        name: 'Boxing Day',
        date: '12-26',
        type: 'Holiday',
        description: 'Post-Christmas rest and community sports.'
    }
];

export function getCulturalEvent(dateStr: string): CulturalEvent | undefined {
    // Expects YYYY-MM-DD or MM-DD
    const monthDay = dateStr.slice(-5);
    return CULTURAL_EVENTS.find(e => e.date === monthDay);
}
