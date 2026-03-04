import { create } from 'zustand';

interface BookingDrawerStore {
    isOpen: boolean;
    selectedActivityId: string | null;
    operatorId: string | null;
    openDrawer: (activityId?: string, operatorId?: string) => void;
    closeDrawer: () => void;
}

export const useBookingDrawer = create<BookingDrawerStore>((set) => ({
    isOpen: false,
    selectedActivityId: null,
    operatorId: null,
    openDrawer: (activityId, operatorId) => set({
        isOpen: true,
        selectedActivityId: activityId || null,
        operatorId: operatorId || null
    }),
    closeDrawer: () => set({ isOpen: false, selectedActivityId: null, operatorId: null }),
}));
