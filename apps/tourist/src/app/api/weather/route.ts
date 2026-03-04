import { NextResponse } from 'next/server';
import { getVanuaLevuWeather } from '@/lib/weather';

export async function GET() {
    try {
        const stats = await getVanuaLevuWeather();
        return NextResponse.json(stats);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 500 });
    }
}
