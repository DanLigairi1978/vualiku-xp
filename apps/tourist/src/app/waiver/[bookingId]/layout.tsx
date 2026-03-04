import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Activity Waiver',
    description:
        'Complete your digital activity waiver for your Vualiku XP adventure. Quick, secure, and paperless.',
};

export default function WaiverLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
