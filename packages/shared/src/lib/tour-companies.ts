export interface TourCompany {
    id: string;
    name: string;
    description: string;
    imageId: string;
    bookingLink: string;
}

export const tourCompanies: TourCompany[] = [
    {
        id: 'waisali-nature-experience',
        name: 'Waisali Nature Experience',
        description: 'Explore pristine rainforests and stunning waterfalls in the heart of Vanua Levu. A true eco-adventure.',
        imageId: 'waisali-nature',
        bookingLink: '/booking?operator=waisali-nature-experience',
    },
    {
        id: 'vorovoro-island',
        name: 'Vorovoro Island',
        description: 'Experience authentic island life. Learn from the local community, snorkel in clear waters, and relax on sandy beaches.',
        imageId: 'vorovoro-island',
        bookingLink: '/booking?operator=vorovoro-island',
    },
    {
        id: 'dromuninuku-heritage',
        name: 'Dromuninuku Heritage and Tours',
        description: 'Step back in time and immerse yourself in Fijian culture, history, and traditions with the people of Dromuninuku.',
        imageId: 'dromuninuku-heritage',
        bookingLink: '/booking?operator=dromuninuku-heritage',
    },
    {
        id: 'drawa-eco-retreat',
        name: 'Drawa Eco Retreat',
        description: 'Deep in the heart of Vanua Levu, the Drawa Eco Retreat protects pristine rainforests while offering immersive jungle trekking, river rafting, and authentic stays.',
        imageId: 'drawa-block',
        bookingLink: '/booking?operator=drawa-eco-retreat',
    },
    {
        id: 'vanualevu-farmstay',
        name: 'Vanualevu Farmstay',
        description: 'Discover the agricultural heart of Fiji. Participate in farm activities, enjoy fresh local food, and relax in a rural setting.',
        imageId: 'vanualevu-farmstay',
        bookingLink: '/booking?operator=vanualevu-farmstay',
    },
    {
        id: 'devo-beach',
        name: 'Devo Beach',
        description: 'Explore the flora and fauna of the Tunuloa Peninsula including Bird watching.',
        imageId: 'devo-beach',
        bookingLink: '/booking?operator=devo-beach',
    },
    {
        id: 'baleyaga-nature',
        name: 'Baleyaga Nature',
        description: 'Trekking and eco-activities.',
        imageId: 'baleyaga-nature',
        bookingLink: '/booking?operator=baleyaga-nature',
    },
];
