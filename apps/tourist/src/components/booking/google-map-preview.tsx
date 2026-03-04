'use client';

import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { BasketItem } from '@/context/BasketContext';

interface MapPreviewProps {
    originId: string | null;
    events: BasketItem[];
}

// Mock coordinates for Vanua Levu tour operators for demo purposes
const MOCK_COORDS: Record<string, { lat: number; lng: number }> = {
    'LBS': { lat: -16.435, lng: 179.339 }, // Labasa Airport
    'SVU': { lat: -16.780, lng: 179.336 }, // Savusavu Airport
    'waisali-nature-experience': { lat: -16.633, lng: 179.283 },
    'vorovoro-island': { lat: -16.350, lng: 179.400 },
    'dromuninuku-heritage': { lat: -16.550, lng: 179.350 },
    'drawa-eco-retreat': { lat: -16.600, lng: 179.150 },
    'vanualevu-farmstay': { lat: -16.700, lng: 179.450 },
    'devo-beach': { lat: -16.800, lng: 179.550 },
    'baleyaga-nature': { lat: -16.480, lng: 179.600 },
};

export function GoogleMapPreview({ originId, events }: MapPreviewProps) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

    // Calculate center based on origin or default to Vanua Levu center
    const center = originId && MOCK_COORDS[originId]
        ? MOCK_COORDS[originId]
        : { lat: -16.6, lng: 179.3 };

    return (
        <APIProvider apiKey={apiKey}>
            <Map
                defaultCenter={center}
                defaultZoom={8}
                mapId="vualiku-checkout-map"
                disableDefaultUI={true}
                gestureHandling="none"
                keyboardShortcuts={false}
                mapTypeId="terrain" // Static Terrain mapping as requested
                className="w-full h-full"
            >
                {/* Origin Marker (Distinctive Start Pin) */}
                {originId && MOCK_COORDS[originId] && (
                    <AdvancedMarker position={MOCK_COORDS[originId]}>
                        <Pin background={"#22c55e"} borderColor={"#14532d"} glyphColor={"#14532d"} />
                    </AdvancedMarker>
                )}

                {/* Sequential Operator Markers */}
                {events.map((evt, idx) => {
                    const coords = MOCK_COORDS[evt.operatorId];
                    if (!coords) return null;

                    return (
                        <AdvancedMarker key={evt.id} position={coords} zIndex={idx + 10}>
                            <div className="w-8 h-8 bg-zinc-800 text-white rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-primary">
                                {idx + 1}
                            </div>
                        </AdvancedMarker>
                    );
                })}
            </Map>
        </APIProvider>
    );
}
