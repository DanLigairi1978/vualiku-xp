import Link from 'next/link';
import Image from 'next/image';
import { useBranding } from '@/context/BrandingContext';

export function Logo() {
  const { branding } = useBranding();

  return (
    <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80" prefetch={false}>
      {branding.logos.main ? (
        <div className="relative h-10 w-auto">
          <img
            src={branding.logos.main}
            alt="Logo"
            className="h-10 w-auto object-contain"
          />
        </div>
      ) : (
        <div className="relative w-10 h-10 flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg animate-pulse" />
          <div className="relative w-8 h-8 bg-primary rounded-tr-[1.5rem] rounded-bl-[1.5rem] rotate-12 flex items-center justify-center">
            <div className="w-1 h-5 bg-background/40 rounded-full -rotate-45" />
          </div>
        </div>
      )}
      <span className="text-2xl font-bold tracking-tight text-white font-primary">
        VUALIKU<span className="text-primary italic">XP</span>
      </span>
    </Link>
  );
}
