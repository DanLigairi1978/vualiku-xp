import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { message, history, currentPage } = await req.json();

        const result = await ai.generate({
            prompt: `You are a helpful and knowledgeable travel assistant for Vualiku XP, a community-based eco-tourism project in Vanua Levu, Fiji. 
      Your goal is to help users discover authentic experiences, learn about local culture, and assist with booking inquiries.
      Be warm, welcoming (use "Bula!"), and provide specific details about tours like Waisali Nature Experience, Vorovoro Island, and Drawa Eco Retreat.
      
      CONTEXT: The user is currently viewing the "${currentPage || 'Home'}" page on our platform. 
      Use this context to be more helpful. For example, if they are on the Checkout page, help them with payment or itinerary questions. 
      If they are on the Directory, suggest tours based on their interest.

      User says: ${message}`,
            messages: history ? history.map((m: any) => ({
                role: m.role,
                content: m.content
            })) : [],
        });

        return NextResponse.json({ text: result.text });
    } catch (error) {
        console.error('AI Assistant Error:', error);
        return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
    }
}
