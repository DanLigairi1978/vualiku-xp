import type { Metadata } from 'next';

// Force dynamic rendering — Algolia search client requires runtime env vars
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Explore Adventures',
    description:
        'Search and discover authentic Fijian eco-tourism experiences. Filter by category, price, and operator to find your perfect Vanua Levu adventure.',
};

export default function ExploreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
