import Link from 'next/link';
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
        <div className="relative h-10 w-auto flex items-center justify-center">
          {/* VXP SVG Logo Representation */}
          <svg viewBox="0 0 160 80" className="h-10 w-auto" xmlns="http://www.w3.org/2000/svg">
            <g font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="80" letter-spacing="-14" transform="matrix(1 0 -0.1 1 10 70)">
              <text x="0" y="0" fill="#3AA820">V</text>
              <text x="45" y="0" fill="#3B3B3B">X</text>
              <text x="96" y="0" fill="#808080">P</text>
            </g>
          </svg>
        </div>
      )}
      <span className="text-2xl font-bold tracking-tight text-white font-primary hidden md:inline-block">
        VUALIKU<span className="text-primary italic">XP</span>
      </span>
    </Link>
  );
}
