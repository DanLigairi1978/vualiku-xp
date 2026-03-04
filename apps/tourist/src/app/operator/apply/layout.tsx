import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Become an Operator',
    description:
        'Apply to become a Vualiku XP tour operator. Join our eco-tourism network and connect with travellers seeking authentic Fijian adventures in Vanua Levu.',
};

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
