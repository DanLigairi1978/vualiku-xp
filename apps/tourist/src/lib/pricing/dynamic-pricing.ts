// Dynamic Pricing Engine — Vualiku XP
// Adjusts activity prices based on demand, season, group size, and time-to-departure.
// All multipliers are configurable; base prices come from MasterEvent data.

import { formatFJD } from '@/lib/currency';

// ─── Season Config ───────────────────────────────────────────────
export type Season = 'peak' | 'shoulder' | 'off';

/** Fiji tourism seasons (approximate) */
function getSeason(date: Date): Season {
    const month = date.getMonth(); // 0-indexed
    // Peak: Jun-Sep (dry season / whale season)
    if (month >= 5 && month <= 8) return 'peak';
    // Shoulder: Apr-May, Oct-Nov
    if (month === 3 || month === 4 || month === 9 || month === 10) return 'shoulder';
    // Off: Dec-Mar (wet / cyclone season)
    return 'off';
}

const SEASON_MULTIPLIERS: Record<Season, number> = {
    peak: 1.25,      // +25% during peak
    shoulder: 1.0,   // Standard pricing
    off: 0.85,       // -15% off-season discount
};

// ─── Demand Surge ────────────────────────────────────────────────
interface DemandConfig {
    /** Current bookings for this slot/date */
    currentBookings: number;
    /** Maximum capacity for the slot */
    maxCapacity: number;
}

function getDemandMultiplier(demand?: DemandConfig): number {
    if (!demand) return 1.0;
    const fillRate = demand.currentBookings / demand.maxCapacity;
    if (fillRate >= 0.9) return 1.30;  // 90%+ full → +30% surge
    if (fillRate >= 0.7) return 1.15;  // 70-89% → +15%
    if (fillRate >= 0.5) return 1.05;  // 50-69% → +5%
    return 1.0;
}

// ─── Group Discount ──────────────────────────────────────────────
function getGroupMultiplier(pax: number): number {
    if (pax >= 10) return 0.85;  // 10+ → 15% off
    if (pax >= 6) return 0.90;   // 6-9 → 10% off
    if (pax >= 4) return 0.95;   // 4-5 → 5% off
    return 1.0;
}

// ─── Early Bird / Last Minute ────────────────────────────────────
function getTimingMultiplier(bookingDate: Date): number {
    const now = new Date();
    const daysOut = Math.floor((bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysOut >= 30) return 0.90;  // 30+ days out → 10% early bird
    if (daysOut >= 14) return 0.95;  // 14-29 days → 5% early bird
    if (daysOut <= 2 && daysOut >= 0) return 1.15;  // Last 2 days → 15% surge
    return 1.0;
}

// ─── Main Pricing Function ──────────────────────────────────────
export interface PricingInput {
    basePrice: number;
    pricingType: 'per_head' | 'per_night';
    pax: number;
    bookingDate: Date;
    demand?: DemandConfig;
}

export interface PricingResult {
    basePrice: number;
    finalPrice: number;            // Per-unit price after all multipliers
    totalPrice: number;            // finalPrice × pax
    savings: number;               // How much saved vs. base total
    breakdown: PricingBreakdown;
    modifiers: PriceModifier[];    // Human-readable labels for the UI
    formattedTotal: string;
    formattedUnit: string;
}

export interface PriceModifier {
    label: string;
    emoji: string;
    delta: number;                 // Percentage change (e.g. +25 or -15)
    type: 'increase' | 'discount' | 'neutral';
}

export interface PricingBreakdown {
    season: { label: string; multiplier: number };
    demand: { label: string; multiplier: number };
    group: { label: string; multiplier: number };
    timing: { label: string; multiplier: number };
    combined: number;
}

export function calculateDynamicPrice(input: PricingInput): PricingResult {
    const { basePrice, pricingType, pax, bookingDate, demand } = input;

    const season = getSeason(bookingDate);
    const seasonMult = SEASON_MULTIPLIERS[season];
    const demandMult = getDemandMultiplier(demand);
    const groupMult = getGroupMultiplier(pax);
    const timingMult = getTimingMultiplier(bookingDate);

    const combined = seasonMult * demandMult * groupMult * timingMult;
    const finalPrice = Math.round(basePrice * combined * 100) / 100;
    const totalPrice = pricingType === 'per_head' ? finalPrice * pax : finalPrice;
    const baseTotal = pricingType === 'per_head' ? basePrice * pax : basePrice;
    const savings = Math.max(0, baseTotal - totalPrice);

    const seasonLabels: Record<Season, string> = {
        peak: '🔥 Peak Season (+25%)',
        shoulder: '☀️ Standard Season',
        off: '🌧️ Off-Season (-15%)',
    };

    const daysOut = Math.floor((bookingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    let timingLabel = '📅 Standard';
    if (daysOut >= 30) timingLabel = '🐦 Early Bird (-10%)';
    else if (daysOut >= 14) timingLabel = '🐦 Early Bird (-5%)';
    else if (daysOut <= 2 && daysOut >= 0) timingLabel = '⚡ Last Minute (+15%)';

    let demandLabel = '📊 Normal Demand';
    if (demand) {
        const fill = demand.currentBookings / demand.maxCapacity;
        if (fill >= 0.9) demandLabel = '🔴 High Demand (+30%)';
        else if (fill >= 0.7) demandLabel = '🟠 Strong Demand (+15%)';
        else if (fill >= 0.5) demandLabel = '🟡 Moderate Demand (+5%)';
    }

    let groupLabel = '👤 Standard (1-3 pax)';
    if (pax >= 10) groupLabel = '👥 Large Group (-15%)';
    else if (pax >= 6) groupLabel = '👥 Group (-10%)';
    else if (pax >= 4) groupLabel = '👥 Small Group (-5%)';

    const modifiers: PriceModifier[] = [];

    // Add season modifier
    if (seasonMult !== 1.0) {
        modifiers.push({
            label: season === 'peak' ? 'Peak Season' : 'Off-Season',
            emoji: season === 'peak' ? '☀️' : '🌧️',
            delta: Math.round((seasonMult - 1) * 100),
            type: seasonMult > 1 ? 'increase' : 'discount'
        });
    }

    // Add group modifier
    if (groupMult !== 1.0) {
        modifiers.push({
            label: pax >= 10 ? 'Large Group' : pax >= 6 ? 'Group' : 'Small Group',
            emoji: '👥',
            delta: Math.round((groupMult - 1) * 100),
            type: groupMult > 1 ? 'increase' : 'discount'
        });
    }

    // Add timing modifier
    if (timingMult !== 1.0) {
        const daysOut = Math.floor((bookingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        modifiers.push({
            label: daysOut >= 14 ? 'Early Bird' : 'Last Minute',
            emoji: daysOut >= 14 ? '🐦' : '⚡',
            delta: Math.round((timingMult - 1) * 100),
            type: timingMult > 1 ? 'increase' : 'discount'
        });
    }

    // Add demand modifier
    if (demandMult !== 1.0) {
        modifiers.push({
            label: 'High Demand',
            emoji: '📊',
            delta: Math.round((demandMult - 1) * 100),
            type: demandMult > 1 ? 'increase' : 'discount'
        });
    }

    return {
        basePrice,
        finalPrice,
        totalPrice,
        savings,
        breakdown: {
            season: { label: seasonLabels[season], multiplier: seasonMult },
            demand: { label: demandLabel, multiplier: demandMult },
            group: { label: groupLabel, multiplier: groupMult },
            timing: { label: timingLabel, multiplier: timingMult },
            combined,
        },
        modifiers,
        formattedTotal: formatFJD(totalPrice),
        formattedUnit: formatFJD(finalPrice),
    };
}
