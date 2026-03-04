import { ai } from '@/ai/genkit';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const ItineraryDaySchema = z.object({
    day: z.number(),
    title: z.string(),
    activities: z.array(
        z.object({
            time: z.string(),
            description: z.string(),
            location: z.string().optional(),
        })
    ),
    tips: z.string().optional(),
});

const ItineraryResponseSchema = z.object({
    title: z.string(),
    summary: z.string(),
    days: z.array(ItineraryDaySchema),
});

export async function POST(req: NextRequest) {
    try {
        const { interests, duration, partySize } = await req.json();

        const result = await ai.generate({
            prompt: `You are an expert travel planner for Vualiku XP in Vanua Levu, Fiji.
      Create a personalized itinerary based on:
      - Duration: ${duration} days
      - Interests: ${interests}
      - Party Size: ${partySize} people

      Include real locations from Vualiku XP's offerings, such as Waisali Nature Experience, Vorovoro Island, Dromuninuku Heritage, Drawa Eco Retreat, Vanualevu Farmstay, Devo Beach, and Baleyaga Nature.
      Provide a realistic schedule with times and activities that align with eco-tourism and authentic Fijian community experiences.`,
            output: { schema: ItineraryResponseSchema },
        });

        return NextResponse.json(result.output);
    } catch (error) {
        console.error('AI Itinerary Generation Error:', error);
        return NextResponse.json({ error: 'Failed to generate itinerary' }, { status: 500 });
    }
}
