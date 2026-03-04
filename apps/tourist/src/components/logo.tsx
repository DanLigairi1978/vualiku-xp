import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80" prefetch={false}>
      <div className="relative w-10 h-10 flex items-center justify-center">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg animate-pulse" />
        <div className="relative w-8 h-8 bg-primary rounded-tr-[1.5rem] rounded-bl-[1.5rem] rotate-12 flex items-center justify-center">
          <div className="w-1 h-5 bg-background/40 rounded-full -rotate-45" />
        </div>
      </div>
      <span className="text-2xl font-bold tracking-tight text-white font-tahoma">
        VUALIKU<span className="text-primary italic">XP</span>
      </span>
    </Link>
  );
}
