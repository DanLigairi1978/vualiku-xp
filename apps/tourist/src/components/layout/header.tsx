'use client';

import { useState, useEffect } from 'react';

import { AuthModal } from '@/components/auth/auth-modal';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, User as UserIcon } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { LanguageToggle } from '@/components/ui/language-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSiteContent } from '@/hooks/useSiteContent';
import { useFeatureFlags } from '@/context/FeatureFlagsContext';

// Hardcoded fallback — used until Firestore loads
const FALLBACK_NAV = [
  { href: '/', label: 'Home', visible: true, highlight: false },
  { href: '/explore', label: 'Explore', visible: true, highlight: false },
  { href: '/packages', label: 'Packages', visible: true, highlight: false },
  { href: '/directory', label: 'Directory', visible: true, highlight: false },
  { href: '/map', label: 'Map', visible: true, highlight: false },
  { href: '/booking', label: 'Booking', visible: true, highlight: false },
  { href: '/blog', label: 'Blog', visible: true, highlight: false },
  { href: '/about', label: 'About', visible: true, highlight: false },
  { href: '/contact', label: 'Contact', visible: true, highlight: false },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const { global } = useSiteContent();
  const flags = useFeatureFlags();

  const isPageVisible = (href: string) => {
    switch (href) {
      case '/': return flags?.pages?.showHomePage !== false;
      case '/explore': return flags?.pages?.showExplorePage !== false;
      case '/packages': return flags?.pages?.showPackagesPage !== false;
      case '/directory': return flags?.pages?.showDirectoryPage !== false;
      case '/map': return flags?.pages?.showMapPage !== false;
      case '/booking': return flags?.pages?.showBookingPage !== false;
      case '/blog': return flags?.pages?.showBlogPage !== false;
      case '/about': return flags?.pages?.showAboutPage !== false;
      case '/contact': return flags?.pages?.showContactPage !== false;
      default: return true;
    }
  };

  // Use Firestore nav items (filtered by visible), fall back to hardcoded
  const navLinks = (global.navigation.items.length > 0
    ? global.navigation.items
    : FALLBACK_NAV
  ).filter(item => item.visible && isPageVisible(item.href));

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = () => {
    signOut(auth);
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('');
  }

  return (
    <header className={cn(
      "fixed top-0 z-50 w-full transition-all duration-500 font-tahoma",
      isScrolled ? "bg-background/40 backdrop-blur-xl border-b border-white/5 py-3 shadow-2xl" : "bg-transparent py-6 border-transparent"
    )}>
      <div className="container mx-auto flex items-center justify-between px-6">
        <Logo />

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wide">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'transition-all hover:text-primary relative group',
                pathname === link.href ? 'text-primary' : 'text-white/70'
              )}
            >
              {link.label}
              {link.highlight && (
                <span className="absolute -top-2 -right-3 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
              <span className={cn(
                "absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[3px] rounded-full bg-primary transition-all duration-300 group-hover:w-full",
                pathname === link.href && "w-6"
              )} />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {!isUserLoading && !user && (
            <button onClick={() => setAuthModalOpen(true)} className="hidden md:flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-bold mr-2">
              <UserIcon className="h-4 w-4" />
              Sign Up / Login
            </button>
          )}

          {!isUserLoading && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-primary/20 overflow-hidden">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                    <AvatarFallback className="bg-primary/20 text-primary">{getInitials(user.displayName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-card/95 backdrop-blur-xl border-primary/10" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none">{user.displayName || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-primary/10" />
                <DropdownMenuItem onClick={() => router.push('/profile')} className="focus:bg-primary/10 focus:text-primary cursor-pointer">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="focus:bg-primary/10 focus:text-primary cursor-pointer text-red-400 focus:text-red-300">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <LanguageToggle />

          <Button asChild className="hidden md:flex btn-forest h-11 px-6 text-sm">
            <Link href="/booking">BOOK TOUR</Link>
          </Button>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background/95 backdrop-blur-xl border-primary/10">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="grid gap-8 py-12">
                  <Logo />
                  <nav className="grid gap-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          'text-xl font-bold px-4 py-3 rounded-2xl transition-all',
                          pathname === link.href ? 'bg-primary/10 text-primary' : 'text-foreground/60 hover:bg-primary/5'
                        )}
                      >
                        {link.label}
                        {link.highlight && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                      </Link>
                    ))}
                  </nav>

                  {!isUserLoading && !user && (
                    <button onClick={() => setAuthModalOpen(true)} className="flex items-center justify-center gap-2 text-white/70 hover:text-white transition-colors text-lg font-bold py-2">
                      <UserIcon className="h-5 w-5" />
                      Sign Up / Login
                    </button>
                  )}

                  <div className="flex items-center justify-center">
                    <LanguageToggle />
                  </div>

                  <Button asChild className="btn-forest w-full h-14 text-lg">
                    <Link href="/booking">BOOK TOUR</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </header>
  );
}
