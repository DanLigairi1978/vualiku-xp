'use client';

import React, { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/auth-modal';
import { useBasket } from '@/context/BasketContext';
import { useToast } from '@/hooks/use-toast';
import { tourCompanies, TourCompany, masterEvents, MasterEvent, standardSlots, pointsOfOrigin, TimeSlotId, PlaceHolderImages, db } from '@vualiku/shared';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { checkForScheduleConflict } from '@/lib/booking-utils';
import { format, parseISO, addDays } from 'date-fns';
import { Shield, MapPin, Calendar as CalendarIcon, Clock, ChevronRight, Trash2, ShoppingBasket, MessageCircle, Ticket, CheckCircle } from 'lucide-react';
import { useFeatureFlags } from '@/context/FeatureFlagsContext';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { WeatherWidget, CulturalAlert } from '@/components/booking/weather-widget';
import { BookingStepTracker } from '@/components/booking/BookingStepTracker';

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const operatorParam = searchParams.get('operator');
  const [operator, setOperator] = useState<TourCompany | null>(null);
  const [firestoreOperators, setFirestoreOperators] = useState<TourCompany[]>([]);

  // Availability rules per operator (keyed by operator id)
  const [operatorRules, setOperatorRules] = useState<Record<string, {
    operatingDays?: number[];
    operatingHoursOpen?: string;
    operatingHoursClose?: string;
    minGroupSize?: number;
    maxGroupSize?: number;
    advanceNoticeHours?: number;
    blackoutDates?: string[];
  }>>({});

  const { user, loading } = useAuth();
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const { items, addItem, removeItem, origin, setOrigin, appliedPromo, setAppliedPromo } = useBasket();
  const { toast } = useToast();

  const [bookingDate, setBookingDate] = useState<string>('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pax, setPax] = useState<number>(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);
  const flags = useFeatureFlags();

  // Promo Code State
  const [promoInput, setPromoInput] = useState('');
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  // Auto-fill from Auth if available
  useEffect(() => {
    // Set initial date safely to avoid hydration mismatch
    setBookingDate(format(addDays(new Date(), 1), 'yyyy-MM-dd'));

    if (user) {
      if (user.displayName) {
        const parts = user.displayName.split(' ');
        setFirstName(parts[0] || '');
        setLastName(parts.length > 1 ? parts.slice(1).join(' ') : '');
      }
      setEmail(user.email || '');
    }
  }, [user]);

  // Fetch active operators from Firestore (with availability rules)
  useEffect(() => {
    const fetchOps = async () => {
      try {
        const q = query(collection(db, 'operators'), where('status', '==', 'active'));
        const snap = await getDocs(q);
        const ops: TourCompany[] = [];
        const rules: typeof operatorRules = {};

        snap.docs.forEach(d => {
          const data = d.data();
          ops.push({
            id: d.id,
            name: data.name || '',
            description: data.description || '',
            imageId: data.heroImageUrl || d.id,
            bookingLink: `/booking?operator=${d.id}`,
          });
          rules[d.id] = {
            operatingDays: data.operatingDays,
            operatingHoursOpen: data.operatingHoursOpen,
            operatingHoursClose: data.operatingHoursClose,
            minGroupSize: data.minGroupSize,
            maxGroupSize: data.maxGroupSize,
            advanceNoticeHours: data.advanceNoticeHours,
            blackoutDates: data.blackoutDates,
          };
        });

        if (ops.length > 0) {
          setFirestoreOperators(ops);
          setOperatorRules(rules);
        }
      } catch (err) {
        console.error('Failed to fetch operators from Firestore:', err);
      }
    };
    fetchOps();
  }, []);

  // Merge: use Firestore operators if available, otherwise hardcoded
  const allOperators = firestoreOperators.length > 0 ? firestoreOperators : tourCompanies;

  useEffect(() => {
    if (!loading && !user) {
      setAuthModalOpen(true);
    }
    if (operatorParam) {
      const found = allOperators.find((c) => c.id === operatorParam) || tourCompanies.find((c) => c.id === operatorParam);
      if (found) setOperator(found);
    }
  }, [loading, user, operatorParam, allOperators]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center">
        <Shield className="animate-pulse h-12 w-12 text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative min-h-screen text-white flex justify-center items-center overflow-hidden selection:bg-primary/30">
        <div className="fixed inset-0 misty-bg opacity-70 pointer-events-none" />
        <div className="container relative z-10 mx-auto px-6 text-center max-w-lg forest-card p-12">
          <div className="h-16 w-16 bg-primary/10 border border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold font-tahoma text-white tracking-tight mb-4">Authentication Required</h1>
          <p className="text-foreground/70 mb-8 font-light">
            You must be signed into your Vualiku XP account to book an upcoming adventure.
          </p>
          <Button onClick={() => setAuthModalOpen(true)} className="btn-forest w-full h-14 text-lg shadow-xl">
            Sign Up / Login to Book
          </Button>
        </div>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
      </div>
    );
  }

  const availableEvents = masterEvents.filter((e) => !operator || e.operatorId === operator.id);

  // Search Filter & Categorization
  const filteredEvents = availableEvents.filter(evt =>
    evt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (evt.category && evt.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const groupedEvents = filteredEvents.reduce((acc, evt) => {
    const cat = evt.category || 'Other Activities';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(evt);
    return acc;
  }, {} as Record<string, MasterEvent[]>);
  const selectedEvent = availableEvents.find((e) => e.id === selectedEventId);
  const dateObject = bookingDate ? parseISO(bookingDate) : undefined;

  // Array of dates currently booked in the Basket
  const bookedDates = items.map(trip => parseISO(trip.date));

  const basketTotalDisplay = items.reduce((sum, trip) => sum + trip.totalPrice, 0);

  const finalTotal = useMemo(() => {
    if (!appliedPromo) return basketTotalDisplay;
    if (appliedPromo.discountType === 'percentage') {
      return Math.max(0, basketTotalDisplay - (basketTotalDisplay * (appliedPromo.discountValue / 100)));
    } else {
      return Math.max(0, basketTotalDisplay - appliedPromo.discountValue);
    }
  }, [basketTotalDisplay, appliedPromo]);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setIsValidatingPromo(true);
    try {
      const promosRef = collection(db, 'promos');
      const q = query(promosRef, where('code', '==', promoInput.trim().toUpperCase()));
      const snap = await getDocs(q);

      if (snap.empty) {
        toast({ title: 'Invalid Code', description: 'This promo code does not exist.', variant: 'destructive' });
        return;
      }

      const promoDoc = snap.docs[0];
      const promoData = promoDoc.data();

      if (!promoData.active) {
        toast({ title: 'Inactive Code', description: 'This promo code is currently disabled.', variant: 'destructive' });
        return;
      }

      if (promoData.maxUses && promoData.currentUses >= promoData.maxUses) {
        toast({ title: 'Code Exhausted', description: 'This promo code has reached its maximum usage limit.', variant: 'destructive' });
        return;
      }

      if (promoData.expiryDate) {
        const expiry = parseISO(promoData.expiryDate);
        expiry.setHours(23, 59, 59, 999);
        if (new Date() > expiry) {
          toast({ title: 'Expired', description: 'This promo code has expired.', variant: 'destructive' });
          return;
        }
      }

      setAppliedPromo({
        id: promoDoc.id,
        code: promoData.code,
        discountType: promoData.discountType,
        discountValue: promoData.discountValue
      });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to validate promo code. Please try again.', variant: 'destructive' });
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleAddToBasket = () => {
    if (!selectedEvent) return;
    if (!bookingDate) {
      toast({ title: 'Missing Date', description: 'Please select an adventure date.', variant: 'destructive' });
      return;
    }

    // C6: Block past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parseISO(bookingDate) < today) {
      toast({ title: 'Invalid Date', description: 'You cannot book a past date. Please select today or a future date.', variant: 'destructive' });
      return;
    }

    // ——— Phase 6: Operator Availability Rules ———
    const rules = operator ? operatorRules[operator.id] : undefined;
    if (rules) {
      // Operating day check
      if (rules.operatingDays && rules.operatingDays.length > 0) {
        const dayOfWeek = parseISO(bookingDate).getDay(); // 0=Sun
        if (!rules.operatingDays.includes(dayOfWeek)) {
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          toast({ title: 'Not Operating', description: `${operator?.name || 'This operator'} does not operate on ${dayNames[dayOfWeek]}s.`, variant: 'destructive' });
          return;
        }
      }

      // Blackout date check
      if (rules.blackoutDates && rules.blackoutDates.includes(bookingDate)) {
        toast({ title: 'Unavailable Date', description: `${operator?.name || 'This operator'} is not available on ${format(parseISO(bookingDate), 'MMMM d, yyyy')}.`, variant: 'destructive' });
        return;
      }

      // Advance notice check
      if (rules.advanceNoticeHours && rules.advanceNoticeHours > 0) {
        const bookingDateTime = parseISO(bookingDate).getTime();
        const minTime = Date.now() + rules.advanceNoticeHours * 60 * 60 * 1000;
        if (bookingDateTime < minTime) {
          toast({ title: 'Too Short Notice', description: `${operator?.name || 'This operator'} requires at least ${rules.advanceNoticeHours} hours advance notice.`, variant: 'destructive' });
          return;
        }
      }
    }

    // C5: Validate pax (use operator rules if available)
    const minPax = rules?.minGroupSize || 1;
    const maxPax = rules?.maxGroupSize || 50;
    if (isNaN(pax) || pax < minPax) {
      toast({ title: 'Group Too Small', description: `Minimum ${minPax} guest${minPax > 1 ? 's' : ''} per booking for this operator.`, variant: 'destructive' });
      setPax(minPax);
      return;
    }
    if (pax > maxPax) {
      toast({ title: 'Group Too Large', description: `Maximum ${maxPax} guests per booking for this operator. Contact us for larger groups.`, variant: 'destructive' });
      setPax(maxPax);
      return;
    }

    // H4: Validate identity fields
    if (!firstName.trim()) {
      toast({ title: 'Name Required', description: 'Please enter your first name.', variant: 'destructive' });
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast({ title: 'Email Required', description: 'Please enter a valid email address.', variant: 'destructive' });
      return;
    }

    const collision = checkForScheduleConflict(items, bookingDate, selectedEvent.slotId);
    if (collision) {
      toast({
        title: 'Schedule Alert',
        description: 'You already have an activity booked for this time slot on this date. Please select a different time or day.',
        variant: 'destructive'
      });
      return;
    }

    addItem({
      operatorId: selectedEvent.operatorId,
      operatorName: selectedEvent.operatorName,
      eventName: selectedEvent.name,
      date: bookingDate,
      timeSlot: standardSlots[selectedEvent.slotId].label,
      pax: pax,
      pricePerPax: selectedEvent.price,
      totalPrice: selectedEvent.price * pax,
      duration: selectedEvent.durationDesc,
      imageUrl: selectedEvent.imageUrl,
    });

    toast({
      title: 'Added to Basket',
      description: `${selectedEvent.name} has been added to your Event Basket.`,
    });

    // Reset event selection
    setSelectedEventId('');
  };

  const clearForm = () => {
    if (user?.displayName) {
      const parts = user.displayName.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.length > 1 ? parts.slice(1).join(' ') : '');
    } else {
      setFirstName('');
      setLastName('');
    }
    setEmail(user?.email || '');
    setPhone('');
    setBookingDate(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
    setSelectedEventId('');
    setPax(1);
  }

  return (
    <div className="relative min-h-screen text-white pt-32 pb-24 overflow-hidden selection:bg-primary/30">
      <div className="fixed inset-0 misty-bg opacity-70 pointer-events-none" />

      <div className="container relative z-10 mx-auto px-6 mb-8">
        <BookingStepTracker currentStep={1} />
      </div>

      <div className="container relative z-10 mx-auto px-6 grid grid-cols-1 xl:grid-cols-4 gap-8">

        {/* Left Column - 75% Layout */}
        <div className="xl:col-span-3 space-y-8">

          {/* Universal Tour Switcher Mega-Menu */}
          <div className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 md:p-6 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold font-tahoma text-white tracking-tight">Select Your Tour Destination</h2>
              <p className="text-primary/70 text-sm font-light">Choose an operator to view their exclusive activities.</p>
            </div>
            <div className="w-full md:w-72">
              <Select
                value={operator?.id || ""}
                onValueChange={(val) => router.push(`/booking?operator=${val}`, { scroll: false })}
              >
                <SelectTrigger className="w-full h-12 bg-white/5 border-primary/30 rounded-xl text-md font-semibold text-primary hover:bg-white/10 transition-colors">
                  <SelectValue placeholder="Choose an Operator..." />
                </SelectTrigger>
                <SelectContent className="bg-green-950/95 backdrop-blur-2xl border-white/10 text-white rounded-xl shadow-2xl">
                  {allOperators.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="focus:bg-primary font-medium py-3 cursor-pointer">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dynamic Hero Banner */}
          <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden border border-white/10 group">
            {operator ? (
              <>
                <Image src={PlaceHolderImages.find((p) => p.id === operator.imageId)?.imageUrl || `/${operator.imageId}.jpg`} alt={operator.name} fill className="object-cover absolute inset-0 z-0 opacity-40 group-hover:opacity-60 transition-opacity duration-1000" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
                <div className="absolute bottom-6 left-8 z-20">
                  <h1 className="text-4xl md:text-5xl font-bold font-tahoma tracking-tight text-white mb-2">{operator.name}</h1>
                  <p className="text-primary/90 text-lg font-light max-w-2xl">{operator.description}</p>
                </div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-green-950/40 to-transparent z-10" />
                <div className="absolute bottom-6 left-8 z-20">
                  <h1 className="text-4xl md:text-5xl font-bold font-tahoma tracking-tight text-white mb-2">Build Your Tour</h1>
                  <p className="text-primary/90 text-lg font-light max-w-2xl">Select a Tour Operator from our directory or pick multiple events to build your ultimate Vualiku XP itinerary.</p>
                </div>
              </>
            )}
          </div>

          {/* Booking Form Card */}
          <div className="forest-card overflow-hidden text-left bg-white/5 border border-primary/20 rounded-3xl backdrop-blur-md">
            <CardHeader className="pb-8 border-b border-white/5">
              <CardTitle className="text-3xl font-bold font-tahoma text-white tracking-tight">Booking Portal</CardTitle>
              <CardDescription className="text-primary/80 text-lg font-light">Enter your details and organize your itinerary.</CardDescription>
            </CardHeader>
            <CardContent className="pt-8 space-y-8">

              {!operator ? (
                <div className="py-12 text-center space-y-4">
                  <div className="h-16 w-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-primary/50" />
                  </div>
                  <h3 className="text-2xl font-bold font-tahoma text-white">Select a Destination</h3>
                  <p className="text-primary/80 font-light max-w-sm mx-auto">Please choose a Tour Operator from the dropdown above to unlock the scheduling tools and activity listings.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 pb-6 border-b border-white/5">
                    <Label className="text-primary font-bold ml-1 flex items-center gap-2">
                      <MapPin className="w-5 h-5" /> Starting Point (Day 1 Transit Anchor)
                    </Label>
                    <Select value={origin || ''} onValueChange={setOrigin}>
                      <SelectTrigger className="bg-white/5 border-white/10 h-14 rounded-xl text-lg w-full md:w-1/2">
                        <SelectValue placeholder="Select Point of Origin..." />
                      </SelectTrigger>
                      <SelectContent className="bg-green-950 border-white/10 text-white backdrop-blur-xl">
                        {pointsOfOrigin.map((pt) => (
                          <SelectItem key={pt.id} value={pt.id} className="focus:bg-primary font-medium">{pt.label} ({pt.category})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-foreground/50 ml-1">Your transit transfer to your first operator will originate from here.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className='space-y-2'>
                      <Label htmlFor="firstName" className="text-primary font-bold ml-1">First Name</Label>
                      <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} className="bg-white/5 border-white/10 h-12 rounded-xl" />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor="lastName" className="text-primary font-bold ml-1">Last Name</Label>
                      <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} className="bg-white/5 border-white/10 h-12 rounded-xl" />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor="email" className="text-primary font-bold ml-1">Email Address</Label>
                      <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-white/5 border-white/10 h-12 rounded-xl" />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor="phone" className="text-primary font-bold ml-1">Phone (Optional)</Label>
                      <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="bg-white/5 border-white/10 h-12 rounded-xl" />
                    </div>
                  </div>

                  {/* WhatsApp Notifications */}
                  <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="whatsappOptIn"
                        checked={whatsappOptIn}
                        onChange={(e) => setWhatsappOptIn(e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-white/20 bg-white/5 text-green-500 focus:ring-green-500/50 cursor-pointer"
                      />
                      <label htmlFor="whatsappOptIn" className="cursor-pointer">
                        <span className="flex items-center gap-2 text-green-400 font-bold text-sm">
                          <MessageCircle className="w-4 h-4" />
                          Receive WhatsApp Notifications
                        </span>
                        <p className="text-foreground/40 text-xs mt-1">
                          Get booking confirmations, 24-hour reminders, and post-trip review requests via WhatsApp. You can opt out at any time.
                        </p>
                      </label>
                    </div>
                    {whatsappOptIn && (
                      <div className="space-y-2 ml-8">
                        <Label htmlFor="whatsappPhone" className="text-green-400/80 font-bold ml-1 text-xs">WhatsApp Number</Label>
                        <Input
                          id="whatsappPhone"
                          type="tel"
                          value={whatsappPhone}
                          onChange={(e) => setWhatsappPhone(e.target.value)}
                          placeholder="+679 1234567"
                          className="bg-white/5 border-green-500/20 h-12 rounded-xl text-white placeholder:text-white/25"
                        />
                        <p className="text-xs text-foreground/30 ml-1">Include country code (e.g. +679 for Fiji)</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-white/5 space-y-6">
                    <h3 className="text-xl font-bold text-white font-tahoma flex items-center gap-2">
                      Select An Event
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-black/20 p-6 rounded-2xl border border-white/5">
                      <div className="md:col-span-5 space-y-2">
                        <Label className="text-primary font-bold ml-1">Adventure / Package</Label>
                        {availableEvents.length > 8 && (
                          <Input
                            type="text"
                            placeholder="Quick Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/5 border-white/10 h-10 rounded-xl mb-4 text-sm"
                          />
                        )}
                        <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                          <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl">
                            <SelectValue placeholder="Choose an Activity" />
                          </SelectTrigger>
                          <SelectContent className="bg-green-950 border-white/10 text-white backdrop-blur-xl max-h-[300px]">
                            {Object.entries(groupedEvents).map(([category, events]) => (
                              <SelectGroup key={category}>
                                <SelectLabel className="font-bold text-primary/70">{category}</SelectLabel>
                                {events.map((evt) => (
                                  <SelectItem key={evt.id} value={evt.id} className="focus:bg-primary font-medium pl-6">
                                    {evt.name} <span className="text-white/50 text-xs ml-2">({evt.price === 0 ? 'Free' : `FJD $${evt.price}`} {evt.pricingType === 'per_head' ? 'Per Pax' : 'Flat/Night'})</span>
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            ))}
                            {Object.keys(groupedEvents).length === 0 && (
                              <div className="p-4 text-center text-white/50 text-sm">No activities found.</div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-4 space-y-2 relative">
                        <Label className="text-primary font-bold ml-1">Adventure Date</Label>
                        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                          <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-full bg-white/5 border-white/10 hover:bg-white/10 hover:text-white justify-start text-left font-normal h-12 rounded-xl", !bookingDate && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                              {bookingDate ? format(dateObject!, "dd/MM/yyyy") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-3 bg-green-950/95 backdrop-blur-3xl border-white/10 text-white rounded-2xl shadow-2xl shadow-black/50" align="start">
                            <Calendar
                              mode="single"
                              selected={dateObject}
                              onSelect={(d) => {
                                if (d) {
                                  setBookingDate(format(d, 'yyyy-MM-dd'));
                                  setIsCalendarOpen(false);
                                }
                              }}
                              initialFocus
                              weekStartsOn={1}
                              modifiers={{ booked: bookedDates }}
                              modifiersClassNames={{ booked: "bg-primary/20 text-primary font-bold border border-primary/50 relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full" }}
                              disabled={[{ before: new Date(new Date().setHours(0, 0, 0, 0)) }]}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="md:col-span-3 space-y-2">
                        <Label className="text-primary font-bold ml-1">Pax / Guests</Label>
                        <Input type="number" min="1" max="50" value={pax} onChange={e => { const v = parseInt(e.target.value); setPax(isNaN(v) ? 1 : Math.max(1, Math.min(50, v))); }} className="bg-white/5 border-white/10 h-12 rounded-xl" />
                      </div>
                    </div>

                    {selectedEvent && (
                      <div className="flex flex-col sm:flex-row items-center justify-between bg-primary/10 border border-primary/20 p-4 rounded-xl gap-4">
                        <div className="flex flex-col">
                          <span className="text-primary font-bold">Standard Time Slot</span>
                          <span className="text-lg text-white font-tahoma">{standardSlots[selectedEvent.slotId].label}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-primary font-bold">Duration</span>
                          <span className="text-lg text-white font-tahoma">{selectedEvent.durationDesc}</span>
                        </div>
                        <div className="w-full sm:w-auto">
                          <Button onClick={handleAddToBasket} className="w-full sm:w-auto h-12 bg-primary text-background hover:bg-primary/90 font-bold px-8">
                            Add to Event Basket
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Cultural Context Alert */}
                    {bookingDate && <CulturalAlert date={bookingDate} />}
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button variant="ghost" onClick={clearForm} className="text-foreground/50 hover:text-white">Reset All Choices</Button>
                  </div>
                </>
              )}
            </CardContent>
          </div>
        </div>

        {/* Right Column - 25% Sidebar (Event Basket) */}
        <div className="xl:col-span-1 space-y-6 h-full flex flex-col">
          {/* Weather Widget */}
          <WeatherWidget />

          <div className="sticky top-32 forest-card bg-white/5 border border-primary/30 rounded-3xl p-6 backdrop-blur-xl flex flex-col min-h-[500px] shadow-2xl">
            <h2 className="text-2xl font-bold font-tahoma text-white flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <span className="flex items-center gap-2"><ShoppingBasket className="w-6 h-6 text-primary" /> Basket</span>
              <span className="bg-primary/20 text-primary text-sm px-3 py-1 rounded-full">{items.length} Items</span>
            </h2>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 italic space-y-4">
                <p>Your basket is empty.</p>
                <p className="text-sm">Select an adventure to build your itinerary.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="bg-black/30 border border-white/5 p-4 rounded-xl relative group">
                    <div className="font-bold text-primary mb-1 text-sm line-clamp-1">{item.eventName}</div>
                    <div className="text-xs text-foreground/70">{format(parseISO(item.date), "MMM d, yyyy")} - {item.timeSlot.split('(')[0]}</div>
                    <div className="text-xs text-foreground/70 mt-1 flex justify-between">
                      <span>{item.pax} Pax</span>
                      <span className="font-bold text-white">FJD ${item.totalPrice}</span>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Promo Code Section */}
            {items.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                <Label className="text-xs font-bold text-primary/70 uppercase tracking-widest flex items-center gap-2">
                  <Ticket className="w-3 h-3" /> Add Promo Code
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    placeholder="e.g. BULA20"
                    className="bg-black/30 border-white/10 text-white font-mono tracking-widest uppercase h-10 text-sm"
                    disabled={isValidatingPromo || !!appliedPromo}
                  />
                  {!appliedPromo ? (
                    <Button
                      onClick={handleApplyPromo}
                      disabled={!promoInput || isValidatingPromo}
                      className="bg-white/10 text-white hover:bg-primary hover:text-black h-10 px-4 whitespace-nowrap"
                    >
                      {isValidatingPromo ? '...' : 'Apply'}
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      onClick={() => { setAppliedPromo(null); setPromoInput(''); }}
                      className="h-10 px-4 whitespace-nowrap"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                {appliedPromo && (
                  <p className="text-xs text-green-400 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Code Applied!
                    {appliedPromo.discountType === 'percentage' ? `${appliedPromo.discountValue}% off` : `$${appliedPromo.discountValue} off`}
                  </p>
                )}
              </div>
            )}

            <div className="mt-auto pt-6 border-t border-white/10 space-y-4">
              <div className="flex flex-col gap-1 font-tahoma">
                <div className="flex justify-between items-end">
                  <span className="text-foreground/60 text-sm mb-1 uppercase tracking-wider">Subtotal</span>
                  <span className={cn("text-xl font-bold", appliedPromo ? "text-foreground/50 line-through" : "text-primary")}>FJD ${basketTotalDisplay.toFixed(2)}</span>
                </div>
                {appliedPromo && (
                  <>
                    <div className="flex justify-between items-end text-green-400">
                      <span className="text-sm uppercase tracking-wider">Discount ({appliedPromo.code})</span>
                      <span className="text-lg font-bold">-FJD ${(basketTotalDisplay - finalTotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-end pt-2 border-t border-white/10 mt-2">
                      <span className="text-white text-sm uppercase tracking-wider">Total</span>
                      <span className="text-3xl font-bold text-primary">FJD ${finalTotal.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
              <Link href="/checkout" className="block">
                <Button disabled={items.length === 0} className="w-full h-14 text-lg font-bold shadow-xl border border-primary/50 group overflow-hidden bg-white/5 hover:bg-primary/20 transition-all text-white">
                  Proceed to Checkout <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Wrap in Suspense to handle `useSearchParams()` properly on client side
export default function BookingPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white"><Shield className="animate-pulse w-10 h-10 text-primary" /></div>}>
      <BookingContent />
    </Suspense>
  )
}
