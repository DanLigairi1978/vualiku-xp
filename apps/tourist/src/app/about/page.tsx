'use client';

import { useSiteContent } from '@/hooks/useSiteContent';
import Image from 'next/image';

export default function AboutPage() {
  const { global } = useSiteContent();
  const { about } = global;

  return (
    <div className="relative min-h-screen text-white pt-32 pb-24 overflow-hidden selection:bg-primary/30">
      {/* Misty Background Layer */}
      <div className="fixed inset-0 misty-bg opacity-70 pointer-events-none" />

      <div className="container relative z-10 mx-auto px-6 max-w-7xl">
        <div className="mx-auto max-w-3xl text-center mb-16 space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight font-tahoma text-shadow-lg">About Us</h1>
          <p className="text-xl leading-relaxed text-foreground/70 font-light">
            {about.missionStatement}
          </p>
        </div>

        <div className="grid gap-12">
          <div className="forest-card max-w-4xl mx-auto">
            <blockquote className="text-2xl italic leading-relaxed text-primary/90 border-l-4 border-primary pl-8 py-4 bg-primary/5 rounded-r-2xl">
              <p>&ldquo;{about.companyStory}&rdquo;</p>
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

          {/* Team Members Section */}
          {about.teamMembers.length > 0 && (
            <div className="max-w-5xl mx-auto w-full">
              <h2 className="text-3xl font-bold font-tahoma text-center mb-12">Our <span className="text-primary italic">Team</span></h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {about.teamMembers.map((member, i) => (
                  <div key={i} className="forest-card text-center space-y-4 p-8">
                    <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-primary/30">
                      {member.imageUrl ? (
                        <Image src={member.imageUrl} alt={member.name} width={96} height={96} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{member.name}</h3>
                      <p className="text-sm text-primary font-medium">{member.role}</p>
                    </div>
                    {member.bio && <p className="text-sm text-foreground/60 font-light">{member.bio}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
