import Link from 'next/link';
import { useBranding } from '@/context/BrandingContext';

export function Logo() {
  const { branding } = useBranding();

  return (
    <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80" prefetch={false}>
      {branding.logos.main && (
        <div className="relative h-10 w-auto">
          <img
            src={branding.logos.main}
            alt="Logo"
            className="h-10 w-auto object-contain"
          />
        </div>
      )}
      <span className="text-2xl font-bold tracking-tight text-white font-primary">
        VUALIKU<span className="text-primary italic">XP</span>
      </span>
    </Link>
  );
}
