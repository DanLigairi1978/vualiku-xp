import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80" prefetch={false}>
      <span className="text-2xl font-bold tracking-tight text-white font-primary">
        VUALIKU<span className="text-primary italic">XP</span>
      </span>
    </Link>
  );
}
