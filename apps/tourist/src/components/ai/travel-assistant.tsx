'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, X, MessageSquare, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAIContext } from '@/context/AIContext';

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

export function TravelAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Bula! I am your Vualiku XP guide. How can I help you plan your Fijian adventure today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const { currentPage } = useAIContext();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    history: messages.map(m => ({ role: m.role, content: [{ text: m.content }] })),
                    currentPage
                }),
            });

            const data = await response.json();
            if (data.text) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again later.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen ? (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="h-16 w-16 rounded-full shadow-2xl bg-primary text-white hover:shadow-primary/40 animate-float transition-all duration-300 border-none"
                >
                    <MessageSquare className="h-6 w-6" />
                </Button>
            ) : (
                <Card className="w-80 md:w-96 h-[550px] shadow-2xl flex flex-col border-white/10 bg-background/60 backdrop-blur-3xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300 rounded-[2.5rem] font-tahoma">
                    <CardHeader className="bg-primary/5 border-b border-white/5 text-white flex flex-row items-center justify-between p-6 space-y-0 text-shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/20 p-2 rounded-xl">
                                <Sparkles className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-bold tracking-tight">Forest Guide</CardTitle>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse" />
                                    <p className="text-[10px] text-foreground/40 uppercase tracking-widest font-bold">Guide Online</p>
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-foreground/40 hover:text-foreground hover:bg-white/5 rounded-full">
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-grow p-6 overflow-hidden">
                        <ScrollArea className="h-full pr-4" ref={scrollRef}>
                            <div className="space-y-6">
                                {messages.map((m, i) => (
                                    <div key={i} className={cn("flex flex-col gap-2", m.role === 'user' ? "items-end" : "items-start")}>
                                        <div className="flex items-center gap-2 px-1">
                                            {m.role === 'assistant' ? (
                                                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary/60">Guide</span>
                                            ) : (
                                                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-foreground/30">You</span>
                                            )}
                                        </div>
                                        <div className={cn(
                                            "text-xs p-4 rounded-2xl max-w-[90%] leading-relaxed shadow-sm",
                                            m.role === 'user'
                                                ? "bg-primary text-background font-bold border border-primary/20 rounded-tr-none"
                                                : "bg-white/5 text-foreground/90 border border-white/5 rounded-tl-none italic"
                                        )}>
                                            {m.content}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex flex-col gap-2 items-start">
                                        <div className="flex items-center gap-2 px-1">
                                            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary/40 animate-pulse">Scanning Forest...</span>
                                        </div>
                                        <div className="bg-white/5 text-xs p-4 rounded-2xl border border-white/5 text-foreground/40 italic">
                                            Checking our tour listings...
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                    <CardFooter className="p-5 bg-black/20 border-t border-white/5">
                        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex w-full gap-2 relative">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Message your guide..."
                                className="h-12 text-xs bg-white/5 border-white/10 focus-visible:ring-primary/50 rounded-2xl pr-12 text-white italic"
                            />
                            <Button type="submit" size="icon" disabled={isLoading} className="absolute right-1.5 top-1.5 h-9 w-9 bg-primary/20 hover:bg-primary text-primary hover:text-white border-none rounded-xl">
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}
