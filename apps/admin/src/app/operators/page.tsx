'use client';

import { useState } from 'react';
import { OperatorList } from '@/components/operators/OperatorList';
import { useOperators } from '@/lib/hooks/useOperators';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Check, ImageIcon } from 'lucide-react';

export default function OperatorsPage() {
    const { operators, loading, migrateFromHardcode } = useOperators();
    const [migrating, setMigrating] = useState(false);
    const [migrateProgress, setMigrateProgress] = useState('');
    const [migrateResult, setMigrateResult] = useState('');

    // Image migration state
    const [migratingImages, setMigratingImages] = useState(false);
    const [imageResult, setImageResult] = useState('');
    const [imageProgress, setImageProgress] = useState<{ name: string; status: string }[]>([]);

    const showImportButton = !loading && operators.length < 10;

    // Show image button if 3+ operators have empty/local heroImageUrl
    const opsNeedingImages = operators.filter(op => {
        const url = op.heroImageUrl || '';
        return !url.startsWith('https://firebasestorage') && !url.startsWith('https://storage.googleapis.com');
    });
    const showImageButton = !loading && opsNeedingImages.length >= 3;

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

    const handleImageMigration = async () => {
        if (!confirm('This will upload all local operator images to Firebase Storage and update Firestore.\nOperators with existing Firebase URLs will be skipped.\n\nContinue?')) return;

        setMigratingImages(true);
        setImageResult('');
        setImageProgress([]);

        try {
            const res = await fetch('/api/admin/migrate-operator-images', { method: 'POST' });
            const data = await res.json();

            if (!res.ok) {
                setImageResult(`Error: ${data.error || 'Unknown error'}`);
                return;
            }

            setImageProgress(data.results || []);
            setImageResult(`Complete: ${data.uploaded} uploaded, ${data.skipped} skipped, ${data.errors} errors`);
        } catch (err: any) {
            setImageResult(`Migration failed: ${err.message}`);
        } finally {
            setMigratingImages(false);
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

                <div className="flex flex-col items-end gap-2">
                    {showImportButton && (
                        <>
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
                        </>
                    )}

                    {showImageButton && (
                        <>
                            <Button onClick={handleImageMigration} disabled={migratingImages} variant="outline"
                                className="border-amber-800/50 text-amber-300 hover:text-amber-200 hover:border-amber-700 h-11 px-5 text-xs font-bold uppercase tracking-widest">
                                {migratingImages ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Uploading Images...</> : <><ImageIcon className="w-4 h-4 mr-2" /> Migrate Operator Images</>}
                            </Button>
                            {imageProgress.length > 0 && (
                                <div className="text-[10px] font-mono space-y-0.5 text-right max-h-32 overflow-y-auto">
                                    {imageProgress.map((r, i) => (
                                        <div key={i} className={r.status === 'uploaded' ? 'text-green-400' : r.status === 'skipped' ? 'text-slate-500' : 'text-amber-400'}>
                                            {r.status === 'uploaded' ? '✅' : r.status === 'skipped' ? '⏭️' : '⚠️'} {r.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {imageResult && (
                                <span className="text-[10px] font-bold text-green-400 flex items-center gap-1">
                                    <Check className="w-3 h-3" /> {imageResult}
                                </span>
                            )}
                        </>
                    )}
                </div>
            </header>

            <OperatorList />
        </main>
    );
}
