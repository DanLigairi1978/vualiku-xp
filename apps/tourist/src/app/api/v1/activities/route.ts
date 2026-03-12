import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api/v1-auth';
import { masterEvents } from '@danligairi1978/shared';

export async function GET(request: NextRequest) {
    // 1. Authenticate with API Key
    const auth = requireApiKey(request);
    if (!auth.authenticated) return auth.error!;

    // 2. Return catalog
    const catalog = masterEvents.map((evt) => ({
        id: evt.id,
        operatorId: evt.operatorId,
        operatorName: evt.operatorName,
        title: evt.name,
        description: evt.name,
        price: evt.price,
        currency: 'FJD',
        pricingType: evt.pricingType,
        duration: evt.durationDesc,
        category: evt.category,
        timeSlot: evt.slotId,
        imageUrl: evt.imageUrl,
    }));

    return NextResponse.json({
        success: true,
        count: catalog.length,
        data: catalog,
    });
}
