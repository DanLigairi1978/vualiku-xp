import { OperatorList } from '@/components/operators/OperatorList';

export default function OperatorsPage() {
    return (
        <main className="p-8 max-w-[1600px] mx-auto space-y-10">
            <header className="flex justify-between items-end">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                            Meridian Node Alpha
                        </span>
                    </div>
                    <h1 className="text-4xl font-black font-tahoma text-white uppercase italic tracking-tighter leading-none">
                        Operator Hub
                    </h1>
                    <p className="text-slate-500 font-light tracking-wide">
                        Partner Management & Onboarding Protocols
                    </p>
                </div>
            </header>

            <OperatorList />
        </main>
    );
}
