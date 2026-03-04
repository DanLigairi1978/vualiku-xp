import { BasketItem } from '@/context/BasketContext';
import { MasterEvent, TimeSlotId, standardSlots } from '@vualiku/shared';

export function checkForScheduleConflict(
    existingBasket: BasketItem[],
    newDate: string,
    newSlotId: TimeSlotId
): boolean {
    if (!existingBasket || existingBasket.length === 0) return false;

    const eventsOnSameDate = existingBasket.filter((item) => item.date === newDate);
    if (eventsOnSameDate.length === 0) return false;

    const newOrder = standardSlots[newSlotId].order;

    for (const event of eventsOnSameDate) {
        const existingSlotData = Object.values(standardSlots).find(s => s.label === event.timeSlot);
        if (!existingSlotData) continue;

        const existingOrder = existingSlotData.order;

        if (existingOrder === newOrder) return true;
        if (existingSlotData.id === 'Overnight' || newSlotId === 'Overnight') return true;
    }

    return false;
}

export function sortBasketChronologically(basket: BasketItem[]): BasketItem[] {
    return [...basket].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateA !== dateB) return dateA - dateB;

        const slotA = Object.values(standardSlots).find(s => s.label === a.timeSlot)?.order ?? Number.MAX_SAFE_INTEGER;
        const slotB = Object.values(standardSlots).find(s => s.label === b.timeSlot)?.order ?? Number.MAX_SAFE_INTEGER;

        return slotA - slotB;
    });
}
