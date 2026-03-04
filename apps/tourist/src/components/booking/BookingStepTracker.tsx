'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
    id: number;
    label: string;
}

const steps: Step[] = [
    { id: 1, label: 'Select Experience' },
    { id: 2, label: 'Review Details' },
    { id: 3, label: 'Sign Waiver' },
    { id: 4, label: 'Confirm & Pay' },
];

interface BookingStepTrackerProps {
    currentStep: number;
}

export function BookingStepTracker({ currentStep }: BookingStepTrackerProps) {
    return (
        <div className="w-full py-8 px-4">
            {/* Desktop Stepper */}
            <div className="hidden sm:flex items-center justify-between relative max-w-2xl mx-auto">
                {/* Connecting Line */}
                <div className="absolute top-5 left-0 w-full h-[2px] bg-white/10 z-0" />
                <motion.div
                    className="absolute top-5 left-0 h-[2px] bg-primary z-0"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                />

                {steps.map((step) => {
                    const isCompleted = currentStep > step.id;
                    const isActive = currentStep === step.id;

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                            <motion.div
                                initial={false}
                                animate={{
                                    backgroundColor: isCompleted || isActive ? 'rgb(34, 197, 94)' : 'transparent',
                                    borderColor: isCompleted || isActive ? 'rgb(34, 197, 94)' : 'rgba(255, 255, 255, 0.1)',
                                    scale: isActive ? 1.1 : 1,
                                }}
                                className={cn(
                                    "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors duration-300",
                                    isActive && "shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="w-5 h-5 text-background font-bold" />
                                ) : (
                                    <span className={cn(
                                        "text-sm font-bold",
                                        isActive ? "text-background" : "text-foreground/40"
                                    )}>
                                        {step.id}
                                    </span>
                                )}

                                {isActive && (
                                    <motion.div
                                        layoutId="pulse"
                                        className="absolute inset-0 rounded-full border-2 border-primary"
                                        animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                    />
                                )}
                            </motion.div>
                            <span className={cn(
                                "text-[10px] uppercase tracking-widest font-bold text-center w-20 transition-colors duration-300",
                                isActive ? "text-primary" : isCompleted ? "text-primary/70" : "text-foreground/20"
                            )}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Mobile Stepper */}
            <div className="sm:hidden flex flex-col items-center gap-4">
                <div className="flex items-center gap-4">
                    {steps.map((step) => {
                        const isCompleted = currentStep > step.id;
                        const isActive = currentStep === step.id;
                        return (
                            <div key={step.id} className="w-2.5 h-2.5 rounded-full bg-white/10 relative">
                                <motion.div
                                    initial={false}
                                    animate={{
                                        scale: isActive || isCompleted ? 1 : 0,
                                        backgroundColor: isActive ? 'rgb(34, 197, 94)' : 'rgba(34, 197, 94, 0.5)',
                                    }}
                                    className="absolute inset-0 rounded-full"
                                />
                            </div>
                        );
                    })}
                </div>
                <div className="text-center">
                    <p className="text-[10px] text-foreground/40 uppercase tracking-widest font-bold">
                        Step {currentStep} of 4
                    </p>
                    <h3 className="text-lg font-bold text-primary italic uppercase tracking-tight">
                        {steps.find(s => s.id === currentStep)?.label}
                    </h3>
                </div>
            </div>
        </div>
    );
}
