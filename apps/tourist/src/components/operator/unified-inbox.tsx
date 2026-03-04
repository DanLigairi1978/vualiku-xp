'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, orderBy, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { KomunikeMessage, MessageChannel } from '@/lib/komunike/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Phone, User, CheckCheck, Clock, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function UnifiedInbox() {
    const firestore = useFirestore();
    const { user } = useUser();
    const [threads, setThreads] = useState<any[]>([]);
    const [selectedThread, setSelectedThread] = useState<string | null>(null);
    const [messages, setMessages] = useState<KomunikeMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');

    // Fetch threads (Mocking for now as we haven't migrated data yet)
    useEffect(() => {
        // In a real app, we'd query the 'komunike' threads collection
        const mockThreads = [
            { id: 'book_123', customerName: 'John Doe', lastMessage: 'Bula! Is the rafting still on?', timestamp: new Date(), channel: 'whatsapp' },
            { id: 'book_456', customerName: 'Sarah Smith', lastMessage: 'Thank you for the wonderful tour!', timestamp: new Date(Date.now() - 3600000), channel: 'viber' },
            { id: 'book_789', customerName: 'David Lee', lastMessage: 'Can I add one more person?', timestamp: new Date(Date.now() - 86400000), channel: 'messenger' },
        ];
        setThreads(mockThreads);
        if (mockThreads.length > 0) setSelectedThread(mockThreads[0].id);
    }, []);

    // Placeholder for sending a message
    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedThread) return;

        console.log(`Sending message to thread ${selectedThread}: ${newMessage}`);
        // TODO: Call NotificationService and write to Firestore

        setNewMessage('');
    };

    return (
        <div className="flex h-[600px] bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-xl">
            {/* Sidebar: Threads */}
            <div className="w-80 border-r border-white/10 flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <h3 className="text-xl font-bold font-tahoma flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-primary" /> Komuniké
                    </h3>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                        {threads.map((thread) => (
                            <button
                                key={thread.id}
                                onClick={() => setSelectedThread(thread.id)}
                                className={cn(
                                    "w-full text-left p-4 rounded-2xl transition-all group",
                                    selectedThread === thread.id
                                        ? "bg-primary/20 border border-primary/30"
                                        : "hover:bg-white/5 border border-transparent"
                                )}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-sm truncate">{thread.customerName}</span>
                                    <span className="text-[10px] text-foreground/40">{format(thread.timestamp, 'HH:mm')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        thread.channel === 'whatsapp' ? "bg-green-500" :
                                            thread.channel === 'viber' ? "bg-purple-500" : "bg-blue-500"
                                    )} />
                                    <p className="text-xs text-foreground/50 truncate flex-1">{thread.lastMessage}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedThread ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <User className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">{threads.find(t => t.id === selectedThread)?.customerName}</h4>
                                    <p className="text-[10px] text-foreground/40 uppercase tracking-widest font-bold">Booking #{selectedThread.split('_')[1]}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                                    <Phone className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-6">
                                {/* Mock Messages */}
                                <div className="flex justify-start">
                                    <div className="max-w-[80%] bg-white/10 p-4 rounded-2xl rounded-tl-none text-sm leading-relaxed">
                                        Bula! Is the rafting still on for tomorrow? We saw the weather report.
                                        <div className="text-[10px] text-foreground/40 mt-2 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> 10:42 AM • WhatsApp
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <div className="max-w-[80%] bg-primary/20 border border-primary/30 p-4 rounded-2xl rounded-tr-none text-sm leading-relaxed">
                                        Bula Vinaka! Yes, the river conditions are currently perfect despite the rain. We'll monitor and update you if anything changes.
                                        <div className="text-[10px] text-primary/60 mt-2 flex items-center justify-end gap-1">
                                            10:45 AM • System <CheckCheck className="w-3 h-3" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-6 border-t border-white/10 bg-white/5">
                            <div className="flex gap-3">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="bg-transparent border-white/10 h-12 rounded-xl focus:border-primary/50 transition-all"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <Button onClick={handleSendMessage} className="h-12 w-12 rounded-xl bg-primary text-black hover:bg-primary/80 transition-all shrink-0">
                                    <Send className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-foreground/20 p-12 text-center">
                        <MessageCircle className="w-20 h-20 mb-4 opacity-10" />
                        <h3 className="text-xl font-bold font-tahoma">Select a Conversation</h3>
                        <p className="max-w-xs text-sm mt-2 font-light">Choose a guest from the list to start communicating across WhatsApp, Viber, or Messenger.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
