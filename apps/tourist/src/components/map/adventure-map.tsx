'use client';

import { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { tourCompanies, db } from '@vualiku/shared';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Hardcoded fallback coordinates
const fallbackLocations: Record<string, { lat: number; lng: number }> = {
    'Waisali Nature Experience': { lat: -16.6333, lng: 179.2333 },
    'Vorovoro Island': { lat: -16.4833, lng: 179.0333 },
    'Dromuninuku Heritage and Tours': { lat: -16.75, lng: 179.3167 },
    'Drawa Eco Retreat': { lat: -16.55, lng: 179.15 },
    'Vanualevu Farmstay': { lat: -16.45, lng: 179.4 },
    'Devo Beach': { lat: -16.7, lng: 179.6 },
    'Baleyaga Nature': { lat: -16.68, lng: 179.7 },
};

interface MapOperator {
    id: string;
    name: string;
    description: string;
    lat: number;
    lng: number;
    bookingLink: string;
}

export default function AdventureMap() {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [operators, setOperators] = useState<MapOperator[]>([]);

    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

    useEffect(() => {
        const fetchOperators = async () => {
            try {
                const q = query(collection(db, 'operators'), where('status', '==', 'active'));
                const snap = await getDocs(q);

                if (snap.docs.length > 0) {
                    const ops: MapOperator[] = snap.docs.map(d => {
                        const data = d.data();
                        // Use Firestore lat/lng if available, then fallback
                        const fallback = fallbackLocations[data.name];
                        return {
                            id: d.id,
                            name: data.name || d.id,
                            description: data.description || '',
                            lat: data.latitude || fallback?.lat || -16.6,
                            lng: data.longitude || fallback?.lng || 179.3,
                            bookingLink: `/booking?operator=${d.id}`,
                        };
                    });
                    setOperators(ops);
                    return;
                }
            } catch (err) {
                console.error('Failed to fetch map operators from Firestore:', err);
            }

            // Fallback to hardcoded tourCompanies
            const fallbackOps: MapOperator[] = tourCompanies.map(c => {
                const coords = fallbackLocations[c.name] || { lat: -16.6, lng: 179.3 };
                return {
                    id: c.id,
                    name: c.name,
                    description: c.description,
                    lat: coords.lat,
                    lng: coords.lng,
                    bookingLink: c.bookingLink || `/booking?operator=${c.id}`,
                };
            });
            setOperators(fallbackOps);
        };

        fetchOperators();
    }, []);

    const selected = operators.find(o => o.id === selectedId);

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
                    {operators.map((op) => (
                        <AdvancedMarker
                            key={op.id}
                            position={{ lat: op.lat, lng: op.lng }}
                            onClick={() => setSelectedId(op.id)}
                        >
                            <Pin
                                background={'#22c55e'}
                                borderColor={'#14532d'}
                                glyphColor={'#ffffff'}
                            />
                        </AdvancedMarker>
                    ))}

                    {selected && (
                        <InfoWindow
                            position={{ lat: selected.lat, lng: selected.lng }}
                            onCloseClick={() => setSelectedId(null)}
                            headerContent={
                                <h3 className="text-sm font-bold text-primary max-w-[150px] truncate pr-2">
                                    {selected.name}
                                </h3>
                            }
                        >
                            <div className="p-1 w-48 font-tahoma text-black">
                                <p className="text-xs text-black/80 mb-3 leading-snug">
                                    {selected.description}
                                </p>
                                <Button asChild className="w-full h-8 text-[10px] bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md">
                                    <Link href={selected.bookingLink}>
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
