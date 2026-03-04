'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface AIContextType {
    currentPage: string;
    contextData: any;
    setContextData: (data: any) => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [currentPage, setCurrentPage] = useState('Home');
    const [contextData, setContextData] = useState({});

    useEffect(() => {
        // Map pathnames to human-readable context
        const routeMap: Record<string, string> = {
            '/': 'Home',
            '/about': 'About Us',
            '/directory': 'Tour Directory',
            '/booking': 'Booking Page',
            '/checkout': 'Checkout & Itinerary Review',
            '/operator/dashboard': 'Operator Command Centre',
            '/community': 'Community Impact Hub',
        };

        setCurrentPage(routeMap[pathname] || 'Vualiku XP Platform');
    }, [pathname]);

    return (
        <AIContext.Provider value={{ currentPage, contextData, setContextData }}>
            {children}
        </AIContext.Provider>
    );
}

export function useAIContext() {
    const context = useContext(AIContext);
    if (context === undefined) {
        throw new Error('useAIContext must be used within an AIProvider');
    }
    return context;
}
