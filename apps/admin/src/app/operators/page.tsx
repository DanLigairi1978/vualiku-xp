'use client';

import { useState } from 'react';
import { OperatorList } from '@/components/operators/OperatorList';
import { useOperators } from '@/lib/hooks/useOperators';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Check } from 'lucide-react';

export default function OperatorsPage() {
    const { operators, loading, migrateFromHardcode } = useOperators();
    const [migrating, setMigrating] = useState(false);
    const [migrateProgress, setMigrateProgress] = useState('');
    const [migrateResult, setMigrateResult] = useState('');

    const showImportButton = !loading && operators.length < 10;

    const handleMigrate = async () => {
        if (!confirm('This will import all legacy hardcoded operators into Firestore.\nExisting operators will not be overwritten.\n\nContinue?')) return;

        setMigrating(true);
        setMigrateResult('');

        try {
            const result = await migrateFromHardcode((current, total, name, action) => {
                setMigrateProgress(`Importing ${current} of ${total}... ${action === 'migrated' ? '✓' : '↷'} ${name}`);
            });

            setMigrateResult(`Successfully imported ${result.migrated} operators (${result.skipped} already existed)`);
        } catch (err: any) {
            setMigrateResult(`Migration failed: ${err.message}`);
        } finally {
            setMigrating(false);
            setMigrateProgress('');
        }
    };

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
                        Partner Management &amp; Onboarding Protocols
                    </p>
                </div>

                {showImportButton && (
                    <div className="flex flex-col items-end gap-2">
                        <Button onClick={handleMigrate} disabled={migrating} variant="outline"
                            className="border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 h-11 px-5 text-xs font-bold uppercase tracking-widest">
                            {migrating ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Importing...</> : <><Download className="w-4 h-4 mr-2" /> Import Legacy Operators</>}
                        </Button>
                        {migrateProgress && <span className="text-[10px] text-slate-500 font-mono">{migrateProgress}</span>}
                        {migrateResult && (
                            <span className="text-[10px] font-bold text-green-400 flex items-center gap-1">
                                <Check className="w-3 h-3" /> {migrateResult}
                            </span>
                        )}
                    </div>
                )}
            </header>

            <OperatorList />
        </main>
    );
}
