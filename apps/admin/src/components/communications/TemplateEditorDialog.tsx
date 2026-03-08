'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmailTemplateConfig, TemplateKey } from '@/lib/hooks/useEmailTemplates';
import { Loader2 } from 'lucide-react';

interface TemplateEditorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    templateKey: TemplateKey;
    templateName: string;
    initialConfig: EmailTemplateConfig;
    onSave: (key: TemplateKey, config: EmailTemplateConfig) => Promise<any>;
}

export function TemplateEditorDialog({
    open,
    onOpenChange,
    templateKey,
    templateName,
    initialConfig,
    onSave
}: TemplateEditorDialogProps) {
    const [config, setConfig] = useState<EmailTemplateConfig>(initialConfig);
    const [isSaving, setIsSaving] = useState(false);

    // Sync state if initialConfig changes externally
    useEffect(() => {
        if (open) {
            setConfig(initialConfig);
        }
    }, [initialConfig, open]);

    const handleChange = (field: keyof EmailTemplateConfig, value: string) => {
        setConfig((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(templateKey, config);
            onOpenChange(false);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const variables = [
        '{{customerName}}',
        '{{eventName}}',
        '{{operatorName}}',
        '{{bookingId}}'
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-slate-950 border-slate-800 text-slate-200 sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black uppercase text-white tracking-widest">{templateName} Config</DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                        Customize the text copy for this automated email. Design and layout are handled by the core platform engine.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap gap-2 items-center text-xs">
                    <span className="text-slate-500 font-bold uppercase tracking-widest">Available Variables:</span>
                    {variables.map(v => (
                        <code key={v} className="bg-slate-950 text-primary px-2 py-0.5 rounded border border-primary/20">{v}</code>
                    ))}
                </div>

                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email Subject Line</Label>
                        <Input
                            value={config.subject}
                            onChange={(e) => handleChange('subject', e.target.value)}
                            className="bg-slate-900 border-slate-800 text-white font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Main Headline</Label>
                            <Input
                                value={config.headline}
                                onChange={(e) => handleChange('headline', e.target.value)}
                                className="bg-slate-900 border-slate-800 text-white font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Subheadline</Label>
                            <Input
                                value={config.subheadline}
                                onChange={(e) => handleChange('subheadline', e.target.value)}
                                className="bg-slate-900 border-slate-800 text-white font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Greeting</Label>
                        <Input
                            value={config.greeting}
                            onChange={(e) => handleChange('greeting', e.target.value)}
                            className="bg-slate-900 border-slate-800 text-white font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Body Intro Content</Label>
                        <textarea
                            value={config.bodyIntro}
                            onChange={(e) => handleChange('bodyIntro', e.target.value)}
                            className="flex min-h-[100px] w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                        />
                        <p className="text-[10px] text-slate-500">Note: Core booking details and QR codes are automatically injected after this intro.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Call to Action Button</Label>
                            <Input
                                value={config.callToAction || ''}
                                onChange={(e) => handleChange('callToAction', e.target.value)}
                                className="bg-slate-900 border-slate-800 text-white font-medium"
                                placeholder="e.g. View Booking"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Footer Text</Label>
                            <Input
                                value={config.footerText || ''}
                                onChange={(e) => handleChange('footerText', e.target.value)}
                                className="bg-slate-900 border-slate-800 text-white font-medium"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="border-t border-slate-800 pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent border-slate-800 text-slate-400 hover:text-white uppercase text-[10px] tracking-widest font-bold">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-primary text-slate-950 hover:bg-primary/90 uppercase text-[10px] tracking-widest font-black">
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Save Configuration
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
