'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface BasketItem {
    id: string; // Unique ID for the basket item
    operatorId: string; // ID of the tour operator
    operatorName: string; // Display name of the operator
    eventName: string; // Name of the event/activity
    date: string; // ISO string or formatted date
    timeSlot: string; // e.g. "Morning 8 AM - 12 PM"
    pax: number; // Number of people
    pricePerPax: number; // Price per person
    totalPrice: number; // pax * pricePerPax
    duration: string; // e.g., "4 Hours"
    imageUrl?: string; // Optional image for the checkout preview
}

export interface AppliedPromo {
    id: string;
    code: string;
    discountType: 'percentage' | 'flat';
    discountValue: number;
}

interface BasketContextType {
    items: BasketItem[];
    addItem: (item: Omit<BasketItem, 'id'>) => void;
    removeItem: (id: string) => void;
    clearBasket: () => void;
    origin: string | null;
    setOrigin: (origin: string | null) => void;
    appliedPromo: AppliedPromo | null;
    setAppliedPromo: (promo: AppliedPromo | null) => void;
}

const BasketContext = createContext<BasketContextType | undefined>(undefined);

export function BasketProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<BasketItem[]>([]);
    const [origin, setOriginState] = useState<string | null>(null);
    const [appliedPromo, setAppliedPromoState] = useState<AppliedPromo | null>(null);

    // Load basket from local storage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem('vualiku_basket');
            if (stored) {
                setItems(JSON.parse(stored));
            }
            const storedOrigin = localStorage.getItem('vualiku_origin');
            if (storedOrigin) {
                setOriginState(storedOrigin);
            }
            const storedPromo = localStorage.getItem('vualiku_promo');
            if (storedPromo) {
                setAppliedPromoState(JSON.parse(storedPromo));
            }
        } catch (e) {
            console.error('Failed to load basket from local storage:', e);
        }
    }, []);

    // Sync basket to local storage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('vualiku_basket', JSON.stringify(items));
            if (appliedPromo) {
                localStorage.setItem('vualiku_promo', JSON.stringify(appliedPromo));
            } else {
                localStorage.removeItem('vualiku_promo');
            }
        } catch (e) {
            console.error('Failed to save basket to local storage:', e);
        }
    }, [items, appliedPromo]);

    const setOrigin = (newOrigin: string | null) => {
        setOriginState(newOrigin);
        if (newOrigin) {
            localStorage.setItem('vualiku_origin', newOrigin);
        } else {
            localStorage.removeItem('vualiku_origin');
        }
    };

    const addItem = (item: Omit<BasketItem, 'id'>) => {
        const newItem: BasketItem = {
            ...item,
            id: Math.random().toString(36).substring(2, 9), // Simple ID generation
        };
        setItems((prev) => [...prev, newItem]);
    };

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const clearBasket = () => {
        setItems([]);
    };

    const setAppliedPromo = (promo: AppliedPromo | null) => {
        setAppliedPromoState(promo);
    };

    return (
        <BasketContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                clearBasket,
                origin,
                setOrigin,
                appliedPromo,
                setAppliedPromo,
            }}
        >
            {children}
        </BasketContext.Provider>
    );
}

export function useBasket() {
    const context = useContext(BasketContext);
    return context ?? {
        items: [],
        addItem: () => {},
        removeItem: () => {},
        clearBasket: () => {},
        origin: null,
        setOrigin: () => {},
        appliedPromo: null,
        setAppliedPromo: () => {}
    };
}
