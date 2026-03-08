import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { AdminGuard } from "@/components/auth/AdminGuard";
import Link from 'next/link';
import { LayoutDashboard, Users, MessageSquare, PieChart, Settings, LogOut, Package, FileText, DollarSign, Image as ImageIcon, ToggleLeft, Ticket } from 'lucide-react';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Meridian Admin Centre",
    description: "Vualiku XP Operational Management",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const navItems = [
        { label: 'Command Centre', icon: LayoutDashboard, href: '/' },
        { label: 'Platform Controls', icon: ToggleLeft, href: '/platform-controls' },
        { label: 'Promotions', icon: Ticket, href: '/promotions' },
        { label: 'Operators', icon: Users, href: '/operators' },
        { label: 'Packages', icon: Package, href: '/packages' },
        { label: 'Bookings', icon: PieChart, href: '/bookings' },
        { label: 'Content', icon: FileText, href: '/content' },
        { label: 'Pricing', icon: DollarSign, href: '/pricing' },
        { label: 'Media', icon: ImageIcon, href: '/media' },
        { label: 'Communications', icon: MessageSquare, href: '/communications' },
        { label: 'Revenue', icon: PieChart, href: '/revenue' },
        { label: 'Settings', icon: Settings, href: '/settings' },
    ];

    return (
        <html lang="en">
            <body className={inter.className}>
                <AuthProvider>
                    <AdminGuard>
                        <div className="flex min-h-screen bg-slate-950 text-slate-50">
                            {/* Sidebar */}
                            <aside className="w-72 border-r border-slate-800 flex flex-col p-6 space-y-8 bg-slate-900/20">
                                <div className="flex items-center gap-3 px-2">
                                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-slate-950 font-black italic">V</div>
                                    <div>
                                        <p className="font-black text-lg tracking-tighter uppercase leading-none italic">Meridian</p>
                                        <p className="text-[10px] text-primary font-bold tracking-widest uppercase">Admin Centre</p>
                                    </div>
                                </div>

                                <nav className="flex-1 space-y-1">
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all group"
                                        >
                                            <item.icon className="w-5 h-5 group-hover:text-primary transition-colors" />
                                            <span className="text-sm font-bold uppercase tracking-widest">{item.label}</span>
                                        </Link>
                                    ))}
                                </nav>

                                <div className="pt-6 border-t border-slate-800">
                                    <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all w-full">
                                        <LogOut className="w-5 h-5" />
                                        <span className="text-sm font-bold uppercase tracking-widest">Terminate Session</span>
                                    </button>
                                </div>
                            </aside>

                            {/* Main Content */}
                            <div className="flex-1">
                                {children}
                            </div>
                        </div>
                    </AdminGuard>
                </AuthProvider>
            </body>
        </html>
    );
}
