import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about Vualiku XP — a community-led eco-tourism initiative by The Meridian Solutions Company, empowering local Fijian tour operators.',
};

export default function AboutPage() {
  return (
    <div className="relative min-h-screen text-white pt-32 pb-24 overflow-hidden selection:bg-primary/30">
      {/* Misty Background Layer */}
      <div className="fixed inset-0 misty-bg opacity-70 pointer-events-none" />

      <div className="container relative z-10 mx-auto px-6 max-w-7xl">
        <div className="mx-auto max-w-3xl text-center mb-16 space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight font-tahoma text-shadow-lg">About Us</h1>
          <p className="text-xl leading-relaxed text-foreground/70 font-light">
            Vualiku XP is a proud initiative by The Meridian Solutions Company. Our goal is to empower local Fijian tour operators and connect travelers with authentic, sustainable experiences.
          </p>
        </div>

        <div className="grid gap-12">
          <div className="forest-card max-w-4xl mx-auto">
            <blockquote className="text-2xl italic leading-relaxed text-primary/90 border-l-4 border-primary pl-8 py-4 bg-primary/5 rounded-r-2xl">
              <p>"The Meridian solutions company provides tailored solutions for budding tour operators in terms of management, financial consultancy and digital marketing."</p>
            </blockquote>
          </div>

          <dl className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="forest-card space-y-4">
              <dt className="text-2xl font-bold font-tahoma text-primary">Our Vision</dt>
              <dd className="text-lg leading-relaxed text-foreground/80 font-light">
                To be the leading platform for sustainable, community-based tourism in Fiji, fostering economic growth and cultural preservation for future generations.
              </dd>
            </div>
            <div className="forest-card space-y-4">
              <dt className="text-2xl font-bold font-tahoma text-primary">Our Approach</dt>
              <dd className="text-lg leading-relaxed text-foreground/80 font-light">
                We empower our partners with operational guidance, financial expertise, and digital marketing strategies, elevating their unique stories to a global audience.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
