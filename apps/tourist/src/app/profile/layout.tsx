import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'My Profile',
    description: 'View your Vualiku XP profile, booking history, and loyalty tier.',
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
