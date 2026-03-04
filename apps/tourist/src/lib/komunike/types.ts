import { Timestamp } from 'firebase/firestore';

export type MessageChannel = 'whatsapp' | 'viber' | 'messenger' | 'internal';
export type MessageSender = 'system' | 'customer' | 'operator';
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed';

export interface KomunikeMessage {
    id: string;
    bookingId: string;
    channel: MessageChannel;
    sender: MessageSender;
    content: string;
    timestamp: Date | Timestamp;
    status: MessageStatus;
    metadata?: Record<string, any>;
}

export interface KomunikeThread {
    bookingId: string;
    customerId: string;
    operatorId: string;
    lastMessage?: KomunikeMessage;
    updatedAt: Date | Timestamp;
    status: 'active' | 'archived';
}
