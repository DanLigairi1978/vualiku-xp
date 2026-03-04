'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, serverTimestamp, addDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, addDays } from 'date-fns';
import { del, get, set } from 'idb-keyval';
import { initializeFirebase } from '@/firebase';

const TOUR_OPERATOR_ID = 'waisali-nature-experience';
const MAX_PARTICIPANTS_PER_DAY = 15;

export type BookingEvent = {
  id: number;
  name: string;
  price: number;
};

export function useBookingForm() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const [participants, setParticipants] = useState(1);
  const [bookingDate, setBookingDate] = useState<string>(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [availableSlots, setAvailableSlots] = useState<number | null>(null);
  const [dailySlots, setDailySlots] = useState<Record<string, number>>({});

  const [selectedEvents, setSelectedEvents] = useState<BookingEvent[]>([{ id: Date.now(), name: '', price: 0 }]);
  const [totalFee, setTotalFee] = useState(0);
  const [isCheckoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  // Load draft on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    get('vualikuxp_booking_draft').then((draft) => {
      if (draft) {
        setFirstName(draft.firstName);
        setLastName(draft.lastName);
        setEmail(draft.email);
        setPhone(draft.phone);
        setParticipants(draft.participants);
        setBookingDate(draft.bookingDate);
        setSelectedEvents(draft.selectedEvents);
        toast({ title: "Draft Restored", description: "Your offline booking draft was recovered." });
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save draft when offline & form data changes
  useEffect(() => {
    if (isOffline) {
      if (firstName || lastName || email || phone) {
        set('vualikuxp_booking_draft', {
          firstName, lastName, email, phone, participants, bookingDate, selectedEvents
        }).catch(err => console.error("Could not save draft:", err));

        toast({
          title: "Offline Mode Active",
          description: "Your booking progress is being saved to your device.",
          duration: 3000
        });
      }
    }
  }, [firstName, lastName, email, phone, participants, bookingDate, selectedEvents, isOffline]);

  useEffect(() => {
    if (!firestore || !bookingDate || isOffline) {
      setAvailableSlots(null);
      return;
    }

    const fetchAllSlots = async () => {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const bookingsQuery = query(
        collection(firestore, 'allBookings'),
        where('tourOperatorId', '==', TOUR_OPERATOR_ID),
        where('bookingDate', '>=', todayStr)
      );

      try {
        const querySnapshot = await getDocs(bookingsQuery);
        const slotsMap: Record<string, number> = {};

        querySnapshot.forEach(doc => {
          const data = doc.data();
          const d = data.bookingDate;
          slotsMap[d] = (slotsMap[d] || 0) + data.participants;
        });

        const availableDaily: Record<string, number> = {};
        Object.entries(slotsMap).forEach(([dateStr, taken]) => {
          availableDaily[dateStr] = Math.max(0, MAX_PARTICIPANTS_PER_DAY - taken);
        });

        setDailySlots(availableDaily);

        const dateStr = format(parseISO(bookingDate), 'yyyy-MM-dd');
        const takenSlots = slotsMap[dateStr] || 0;
        setAvailableSlots(Math.max(0, MAX_PARTICIPANTS_PER_DAY - takenSlots));
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchAllSlots();
  }, [firestore, bookingDate]);

  useEffect(() => {
    const fee = selectedEvents.reduce((acc, event) => acc + event.price, 0) * participants;
    setTotalFee(fee);
  }, [selectedEvents, participants]);

  const handleEventChange = (id: number, eventName: string, availableEvents: any[]) => {
    const event = availableEvents.find(e => e.name === eventName);
    if (!event) return;

    setSelectedEvents(prevEvents =>
      prevEvents.map(e => (e.id === id ? { ...e, name: event.name, price: event.price } : e))
    );
  };

  const addEvent = () => {
    if (selectedEvents.length < 5) {
      setSelectedEvents(prev => [...prev, { id: Date.now(), name: '', price: 0 }]);
    }
  };

  const removeEvent = (id: number) => {
    setSelectedEvents(prev => prev.filter(e => e.id !== id));
  };

  const validateBooking = () => {
    const finalSelectedEvents = selectedEvents.filter(e => e.name);

    if (!bookingDate || participants <= 0 || !firstName || !lastName || !email || finalSelectedEvents.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill out all required fields and select at least one event.",
      });
      return false;
    }

    if (availableSlots !== null && participants > availableSlots) {
      toast({
        variant: "destructive",
        title: "Not enough slots available",
        description: `Only ${availableSlots} slots are left for this date.`,
      });
      return false;
    }

    return true;
  };

  const submitBooking = async () => {
    if (!firestore) return;

    const finalSelectedEvents = selectedEvents.filter(e => e.name);
    setIsSubmitting(true);

    try {
      const user = initializeFirebase().auth.currentUser;
      const idToken = user ? await user.getIdToken() : '';

      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          participants: Number(participants),
          bookingDate: format(parseISO(bookingDate), 'yyyy-MM-dd'),
          tourOperatorId: TOUR_OPERATOR_ID,
          selectedActivities: finalSelectedEvents.map(({ name }) => ({ name })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }

      const result = await response.json();
      setConfirmedBookingId(result.bookingId);

      await del('vualikuxp_booking_draft');

      toast({ title: "Booking Confirmed!", description: "Your booking was successfully processed server-side." });
      resetForm();
      return true;
    } catch (error) {
      console.error("Booking submission error:", error);
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: "Could not save your booking. Please try again.",
      });
      return false;
    } finally {
      setIsSubmitting(false);
      setCheckoutDialogOpen(false);
    }
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setParticipants(1);
    setBookingDate(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
    setSelectedEvents([{ id: Date.now(), name: '', price: 0 }]);
  };

  return {
    state: {
      firstName,
      lastName,
      email,
      phone,
      participants,
      bookingDate,
      selectedEvents,
      totalFee,
      availableSlots,
      dailySlots,
      isCheckoutDialogOpen,
      isSubmitting,
      isOffline,
      maxParticipants: MAX_PARTICIPANTS_PER_DAY,
      confirmedBookingId,
    },
    setFirstName,
    setLastName,
    setEmail,
    setPhone,
    setParticipants,
    setBookingDate,
    setCheckoutDialogOpen,
    handleEventChange,
    addEvent,
    removeEvent,
    validateBooking,
    submitBooking,
  };
}
