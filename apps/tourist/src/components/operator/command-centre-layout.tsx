'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    MessageSquare,
    CalendarDays,
    Settings,
    Package,
    LogOut,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

interface NavItem {
    id: string;
    label: string;
    icon: any;
    path?: string;
}

const NAV_ITEMS: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inbox', label: 'Komuniké Inbox', icon: MessageSquare },
    { id: 'bookings', label: 'Manage Bookings', icon: CalendarDays },
    { id: 'activities', label: 'My Activities', icon: Package },
    { id: 'analytics', label: 'Insights', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
];

export function CommandCentreLayout({
    children,
    activeTab,
    setActiveTab
}: {
    children: React.ReactNode;
    activeTab: string;
    setActiveTab: (id: string) => void;
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const router = useRouter();
    const auth = useAuth();

    const handleSignOut = async () => {
        if (auth) {
            await signOut(auth);
            router.push('/operator/login');
        }
    };

    return (
        <div className="flex h-screen bg-background text-white overflow-hidden">
            {/* Sidebar */}
            <aside className={cn(
                "bg-white/5 border-r border-white/10 transition-all duration-300 flex flex-col z-20 backdrop-blur-3xl",
                isCollapsed ? "w-20" : "w-72"
            )}>
                {/* Logo Area */}
                <div className="p-6 border-b border-white/10 flex items-center gap-4 overflow-hidden h-24">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                        <Shield className="w-6 h-6 text-black" />
                    </div>
                    {!isCollapsed && (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                            <h2 className="font-bold text-lg font-tahoma tracking-wider uppercase">Command</h2>
                            <p className="text-[10px] text-primary font-bold tracking-[0.2em] uppercase">Centre v2</p>
                        </div>
                    )}
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 py-6 px-3 space-y-1">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "w-full flex items-center gap-4 p-4 rounded-2xl transition-all group relative",
                                activeTab === item.id
                                    ? "bg-primary/20 text-primary border border-primary/20"
                                    : "text-foreground/50 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-primary" : "text-foreground/40 group-hover:text-white")} />
                            {!isCollapsed && (
                                <span className="font-bold text-sm tracking-tight">{item.label}</span>
                            )}
                            {activeTab === item.id && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                            )}
                        </button>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-3 border-t border-white/10 space-y-1">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl text-foreground/40 hover:bg-white/5 hover:text-white transition-all"
                    >
                        {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                        {!isCollapsed && <span className="text-sm font-bold">Collapse Sidebar</span>}
                    </button>
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500/60 hover:bg-red-500/10 hover:text-red-400 transition-all font-bold"
                    >
                        <LogOut className="w-5 h-5" />
                        {!isCollapsed && <span className="text-sm font-bold">End Session</span>}
                    </button>
                </div>
            </aside>

            {/* Main Workspace */}
            <main className="flex-1 overflow-y-auto relative no-scrollbar">
                <div className="fixed inset-0 misty-bg opacity-40 pointer-events-none" />
                <div className="relative z-10 p-8 pt-12 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
