'use client';

import React, { useState, useEffect } from 'react';
import { useWhatsAppBot, WhatsAppBotConfig } from '@/lib/hooks/useWhatsAppBot';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    MessageSquare,
    Save,
    RotateCcw,
    Bot,
    Zap,
    Info,
    Smartphone,
    CheckCircle2,
    AlertCircle,
    Copy,
    Plus,
    X
} from 'lucide-react';
import { toast } from 'sonner';

export default function WhatsAppBotPage() {
    const { config, loading, updateWhatsAppConfig, DEFAULT_WHATSAPP_CONFIG } = useWhatsAppBot();
    const [localConfig, setLocalConfig] = useState<WhatsAppBotConfig | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [previewStep, setPreviewStep] = useState<keyof WhatsAppBotConfig['templates']>('START');

    useEffect(() => {
        if (config && !localConfig) {
            setLocalConfig(JSON.parse(JSON.stringify(config)));
        }
    }, [config, localConfig]);

    if (loading || !localConfig) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await updateWhatsAppConfig(localConfig);
            toast.success('WhatsApp bot configuration saved');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save configuration');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        if (confirm('Reset all templates to default values?')) {
            setLocalConfig({
                ...DEFAULT_WHATSAPP_CONFIG,
                isActive: localConfig.isActive
            });
            toast.info('Templates reset to defaults (don\'t forget to save)');
        }
    };

    const updateTemplate = (key: keyof WhatsAppBotConfig['templates'], value: string) => {
        setLocalConfig(prev => {
            if (!prev) return null;
            return {
                ...prev,
                templates: {
                    ...prev.templates,
                    [key]: value
                }
            };
        });
    };

    const addResetCommand = (cmd: string) => {
        const clean = cmd.trim().toLowerCase();
        if (!clean) return;
        if (localConfig.templates.RESET_COMMANDS.includes(clean)) {
            toast.error('Command already exists');
            return;
        }
        setLocalConfig(prev => {
            if (!prev) return null;
            return {
                ...prev,
                templates: {
                    ...prev.templates,
                    RESET_COMMANDS: [...prev.templates.RESET_COMMANDS, clean]
                }
            };
        });
    };

    const removeResetCommand = (cmd: string) => {
        setLocalConfig(prev => {
            if (!prev) return null;
            return {
                ...prev,
                templates: {
                    ...prev.templates,
                    RESET_COMMANDS: prev.templates.RESET_COMMANDS.filter(c => c !== cmd)
                }
            };
        });
    };

    const renderPreview = (text: string) => {
        // Simple mock interpolation for preview
        return text
            .replace('{{operators}}', '1. Adventure Co\n2. Eco Tours')
            .replace('{{operatorName}}', 'Adventure Co')
            .replace('{{activities}}', '1. Jungle Trek\n2. River Rafting')
            .replace('{{activityName}}', 'Jungle Trek')
            .replace('{{date}}', '2024-10-15')
            .replace('{{bookingUrl}}', 'vualiku-xp.com/book/123');
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-24">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                            <Bot className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight uppercase">Bot <span className="text-primary">Command</span></h1>
                    </div>
                    <p className="text-slate-500 font-medium max-w-xl">Configure the conversational AI that handles automated bookings via WhatsApp.</p>
                </div>
                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        onClick={handleReset}
                        className="bg-slate-950 border-slate-800 text-slate-400 hover:text-white rounded-xl h-12 px-6"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl h-12 px-8 shadow-[0_4px_20px_rgba(34,197,94,0.3)]"
                    >
                        {isSaving ? <RotateCcw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Controls */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Bot Status */}
                    <section className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h2 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-amber-400" />
                                    Active Status
                                </h2>
                                <p className="text-xs text-slate-500 font-medium">Toggle the booking bot on or off globally.</p>
                            </div>
                            <Switch
                                checked={localConfig.isActive}
                                onCheckedChange={(val) => setLocalConfig({ ...localConfig, isActive: val })}
                                className="scale-125"
                            />
                        </div>

                        {!localConfig.isActive && (
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-200/70 font-medium leading-relaxed">
                                    The bot is currently <span className="text-amber-400 font-bold uppercase">disabled</span>.
                                    Incoming WhatsApp messages will not receive an automated response.
                                </p>
                            </div>
                        )}
                    </section>

                    {/* Templates */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-bold text-white uppercase tracking-tight">Response Templates</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {(Object.entries(localConfig.templates) as [keyof WhatsAppBotConfig['templates'], any][]).map(([key, value]) => {
                                if (key === 'RESET_COMMANDS') return null;
                                return (
                                    <div key={key} className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-6 space-y-4 group">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{key.replace('_', ' ')}</Label>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 text-[10px] uppercase font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => setPreviewStep(key)}
                                            >
                                                Preview in phone
                                            </Button>
                                        </div>
                                        <Textarea
                                            value={value}
                                            onChange={(e) => updateTemplate(key, e.target.value)}
                                            className="min-h-[120px] bg-slate-950/50 border-slate-800 rounded-2xl p-4 text-sm font-medium leading-relaxed focus:border-primary/50 transition-colors"
                                            placeholder={`Enter ${key} response...`}
                                        />
                                        <div className="flex flex-wrap gap-2">
                                            {key === 'START' && <Badge text="{{operators}}" />}
                                            {key === 'SEARCH' && <Badge text="{{operatorName}}" />}
                                            {key === 'SEARCH' && <Badge text="{{activities}}" />}
                                            {key === 'DATE' && <Badge text="{{activityName}}" />}
                                            {key === 'CONFIRM' && <Badge text="{{activityName}}" />}
                                            {key === 'CONFIRM' && <Badge text="{{date}}" />}
                                            {key === 'CONFIRM' && <Badge text="{{bookingUrl}}" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Reset Commands */}
                        <section className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-8 space-y-6">
                            <div className="space-y-1">
                                <h2 className="text-lg font-bold text-white uppercase tracking-tight">Reset Commands</h2>
                                <p className="text-xs text-slate-500 font-medium">Keywords that trigger the bot to restart from the beginning.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {localConfig.templates.RESET_COMMANDS.map(cmd => (
                                    <div key={cmd} className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl group/cmd">
                                        <span className="text-xs font-bold text-primary">{cmd}</span>
                                        <button onClick={() => removeResetCommand(cmd)} className="text-slate-600 hover:text-red-400">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-xl">
                                    <input
                                        type="text"
                                        placeholder="Add new..."
                                        className="bg-transparent border-none outline-none text-xs font-bold text-primary placeholder:text-primary/40 w-20"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                addResetCommand(e.currentTarget.value);
                                                e.currentTarget.value = '';
                                            }
                                        }}
                                    />
                                    <Plus className="w-3 h-3 text-primary" />
                                </div>
                            </div>
                        </section>
                    </section>
                </div>

                {/* iPhone Preview Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-6">
                        <div className="flex items-center gap-2 px-2">
                            <Smartphone className="w-4 h-4 text-slate-500" />
                            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Live Preview</h2>
                        </div>

                        <div className="relative mx-auto w-[280px] h-[580px] bg-slate-950 border-[6px] border-slate-900 rounded-[3rem] shadow-2xl overflow-hidden">
                            {/* iPhone Notch */}
                            <div className="absolute top-0 inset-x-0 h-6 flex justify-center items-start z-10">
                                <div className="bg-slate-900 w-24 h-5 rounded-b-2xl"></div>
                            </div>

                            {/* Status Bar */}
                            <div className="h-10 bg-slate-900/50 flex items-end justify-between px-6 pb-1 text-[10px] text-white/50 font-bold">
                                <span>9:41</span>
                                <div className="flex gap-1 items-center">
                                    <div className="w-3 h-2 bg-white/20 rounded-[1px]"></div>
                                    <div className="w-4 h-2 bg-green-500 rounded-[1px]"></div>
                                </div>
                            </div>

                            {/* WhatsApp Header */}
                            <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">V</div>
                                <div>
                                    <p className="text-[11px] font-black text-white leading-none">Vualiku XP Bot</p>
                                    <p className="text-[9px] text-primary leading-none mt-1">online</p>
                                </div>
                            </div>

                            {/* Message Area */}
                            <div className="p-4 space-y-4 h-[440px] overflow-y-auto bg-[url('https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd850eb25-whatsapp-wallpaper-dark-mode.jpg')] bg-cover">
                                <div className="flex justify-end">
                                    <div className="bg-emerald-900/80 backdrop-blur-sm rounded-2xl rounded-tr-none p-3 max-w-[85%] shadow-md">
                                        <p className="text-[10px] text-white leading-relaxed">Hi, I want to book a tour</p>
                                        <p className="text-[8px] text-white/40 text-right mt-1">9:41 AM</p>
                                    </div>
                                </div>

                                <div className="flex justify-start">
                                    <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl rounded-tl-none p-4 max-w-[85%] shadow-lg border border-white/5">
                                        <p className="text-[11px] text-white leading-relaxed whitespace-pre-wrap font-medium">
                                            {renderPreview(localConfig.templates[previewStep as keyof typeof localConfig.templates] as string)}
                                        </p>
                                        <p className="text-[8px] text-white/40 text-right mt-1">9:41 AM</p>
                                    </div>
                                </div>
                            </div>

                            {/* Input Area */}
                            <div className="absolute bottom-0 inset-x-0 h-16 bg-slate-900 border-t border-slate-800 flex items-center px-4 gap-2">
                                <div className="flex-1 bg-slate-950 h-9 rounded-full px-4 flex items-center">
                                    <span className="text-[10px] text-slate-500">Type a message...</span>
                                </div>
                                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white">
                                    <Zap className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center gap-2 text-primary">
                                <Info className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Formatting Tip</span>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                                Use <code className="text-primary font-bold">*text*</code> for bold and <code className="text-primary font-bold">_text_</code> for italic. WhatsApp supports these standard markdown options.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Badge({ text }: { text: string }) {
    return (
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
            {text}
        </span>
    );
}
