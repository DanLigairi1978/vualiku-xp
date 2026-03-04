'use client';

import { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { tourCompanies } from '@vualiku/shared';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Coordinates for communities in Vanua Levu
const locations: Record<string, { lat: number; lng: number }> = {
    'Waisali Nature Experience': { lat: -16.6333, lng: 179.2333 },
    'Vorovoro Island': { lat: -16.4833, lng: 179.0333 },
    'Dromuninuku Heritage and Tours': { lat: -16.75, lng: 179.3167 },
    'Drawa Eco Retreat': { lat: -16.55, lng: 179.15 },
    'Vanualevu Farmstay': { lat: -16.45, lng: 179.4 },
    'Devo Beach': { lat: -16.7, lng: 179.6 },
    'Baleyaga Nature': { lat: -16.68, lng: 179.7 },
};

export default function AdventureMap() {
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

    // Fallback if the user hasn't added their API key to .env.local yet
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

    return (
        <div className="w-full h-[70vh] rounded-[2rem] overflow-hidden border border-primary/20 relative z-10 shadow-2xl">
            <APIProvider apiKey={API_KEY}>
                <Map
                    defaultCenter={{ lat: -16.6, lng: 179.3 }}
                    defaultZoom={9}
                    mapId="DEMO_MAP_ID"
                    style={{ width: '100%', height: '100%' }}
                    disableDefaultUI={true}
                    zoomControl={true}
                >
                    {tourCompanies.map((company) => {
                        const coords = locations[company.name];
                        if (!coords) return null;

                        return (
                            <AdvancedMarker
                                key={company.name}
                                position={coords}
                                onClick={() => setSelectedCompany(company.name)}
                            >
                                <Pin
                                    background={'#22c55e'}
                                    borderColor={'#14532d'}
                                    glyphColor={'#ffffff'}
                                />
                            </AdvancedMarker>
                        );
                    })}

                    {selectedCompany && (
                        <InfoWindow
                            position={locations[selectedCompany]}
                            onCloseClick={() => setSelectedCompany(null)}
                            headerContent={
                                <h3 className="text-sm font-bold text-primary max-w-[150px] truncate pr-2">
                                    {selectedCompany}
                                </h3>
                            }
                        >
                            <div className="p-1 w-48 font-tahoma text-black">
                                <p className="text-xs text-black/80 mb-3 leading-snug">
                                    {tourCompanies.find(c => c.name === selectedCompany)?.description}
                                </p>
                                <Button asChild className="w-full h-8 text-[10px] bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md">
                                    <Link href={tourCompanies.find(c => c.name === selectedCompany)?.bookingLink || '/booking'}>
                                        BOOK TOUR
                                    </Link>
                                </Button>
                            </div>
                        </InfoWindow>
                    )}
                </Map>
            </APIProvider>
        </div>
    );
}
