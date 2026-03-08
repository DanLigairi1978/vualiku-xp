'use client';

import { useState, useEffect } from 'react';
import { useContent, HomepageContent, GlobalContent } from '@/lib/hooks/useContent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Save, Loader2, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = ['Homepage', 'About', 'Contact', 'Footer', 'SEO'] as const;
type TabId = typeof TABS[number];

// Default values for empty Firestore
const defaultHomepage: HomepageContent = {
    hero: { headline: 'Experience Raw Fiji', subheadline: 'Step off the beaten path into the mist.', heroImageUrl: '', ctaText: 'START YOUR STORY', ctaLink: '/explore' },
    featuredTitle: 'Featured Packages', featuredSubtitle: 'Curated adventures for every traveller',
    whySection: {
        title: 'Why Vualiku XP', features: [
            { icon: 'Mountain', title: 'Untouched Nature', description: 'Explore pristine rainforests and waterfalls.' },
            { icon: 'Users', title: 'Community Led', description: 'Every tour supports local communities.' },
            { icon: 'Shield', title: 'Verified Operators', description: 'All operators are vetted and trusted.' },
        ]
    },
    testimonials: [], stats: { tours: 12, operators: 8, happyGuests: 500, yearsExperience: 5 },
    announcement: { enabled: false, text: '', color: '#22c55e', link: '' },
};

const defaultGlobal: GlobalContent = {
    navigation: {
        items: [
            { label: 'Explore', href: '/explore', visible: true, highlight: false },
            { label: 'Packages', href: '/packages', visible: true, highlight: false },
            { label: 'Directory', href: '/directory', visible: true, highlight: false },
            { label: 'About', href: '/about', visible: true, highlight: false },
        ]
    },
    contact: { phone: '+679 123 4567', email: 'hello@vualiku-xp.com', address: 'Vanua Levu, Fiji', whatsapp: '+679 123 4567', socialLinks: [], mapLat: '-16.5', mapLng: '179.2' },
    about: { missionStatement: '', companyStory: '', teamMembers: [] },
    footer: { tagline: 'Experience Raw Fiji', links: [], socialLinks: [], copyrightText: '© 2026 Vualiku XP. All rights reserved.' },
    seo: { defaultTitleFormat: '%s — Vualiku XP', defaultDescription: 'Authentic eco-tourism in Fiji', ogImageUrl: '', googleAnalyticsId: '' },
};

export default function ContentPage() {
    const { data: homepageData, loading: hLoading, saveContent: saveHomepage } = useContent('homepage');
    const { data: globalData, loading: gLoading, saveContent: saveGlobal } = useContent('global');
    const [tab, setTab] = useState<TabId>('Homepage');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [homepage, setHomepage] = useState<HomepageContent>(defaultHomepage);
    const [global, setGlobal] = useState<GlobalContent>(defaultGlobal);

    useEffect(() => {
        if (homepageData) setHomepage({ ...defaultHomepage, ...homepageData });
    }, [homepageData]);

    useEffect(() => {
        if (globalData) setGlobal({ ...defaultGlobal, ...globalData });
    }, [globalData]);

    const handleSave = async () => {
        setSaving(true);
        try {
            if (tab === 'Homepage') await saveHomepage(homepage);
            else await saveGlobal(global);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error('Save failed:', err);
        } finally {
            setSaving(false);
        }
    };

    if (hLoading || gLoading) {
        return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center"><FileText className="w-5 h-5 text-primary" /></div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">Content Control</h1>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Platform Content Management</p>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-primary text-slate-950 hover:bg-primary/90 h-12 px-6 font-bold uppercase tracking-widest text-xs">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    {saved ? 'SAVED ✓' : 'SAVE CHANGES'}
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
                {TABS.map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={cn("flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                            tab === t ? "bg-primary text-slate-950" : "text-slate-500 hover:text-white hover:bg-slate-800"
                        )}>{t}</button>
                ))}
            </div>

            {/* Homepage Tab */}
            {tab === 'Homepage' && (
                <div className="space-y-8">
                    {/* Hero */}
                    <section className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Hero Section</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Headline</Label>
                                <Input className="bg-slate-950 border-slate-800 h-12" value={homepage.hero.headline}
                                    onChange={e => setHomepage({ ...homepage, hero: { ...homepage.hero, headline: e.target.value } })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">CTA Button Text</Label>
                                <Input className="bg-slate-950 border-slate-800 h-12" value={homepage.hero.ctaText}
                                    onChange={e => setHomepage({ ...homepage, hero: { ...homepage.hero, ctaText: e.target.value } })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sub-headline</Label>
                            <textarea className="w-full min-h-[80px] bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-primary/50"
                                value={homepage.hero.subheadline} onChange={e => setHomepage({ ...homepage, hero: { ...homepage.hero, subheadline: e.target.value } })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">CTA Link</Label>
                                <Input className="bg-slate-950 border-slate-800 h-10" value={homepage.hero.ctaLink}
                                    onChange={e => setHomepage({ ...homepage, hero: { ...homepage.hero, ctaLink: e.target.value } })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hero Image URL</Label>
                                <Input className="bg-slate-950 border-slate-800 h-10" value={homepage.hero.heroImageUrl}
                                    onChange={e => setHomepage({ ...homepage, hero: { ...homepage.hero, heroImageUrl: e.target.value } })} />
                            </div>
                        </div>
                    </section>

                    {/* Stats */}
                    <section className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Stats Bar</h2>
                        <div className="grid grid-cols-4 gap-4">
                            {(['tours', 'operators', 'happyGuests', 'yearsExperience'] as const).map(key => (
                                <div key={key} className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</Label>
                                    <Input type="number" className="bg-slate-950 border-slate-800 h-10" value={homepage.stats[key]}
                                        onChange={e => setHomepage({ ...homepage, stats: { ...homepage.stats, [key]: parseInt(e.target.value) || 0 } })} />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Announcement Banner */}
                    <section className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Announcement Banner</h2>
                            <button onClick={() => setHomepage({ ...homepage, announcement: { ...homepage.announcement, enabled: !homepage.announcement.enabled } })} className="text-slate-400 hover:text-white">
                                {homepage.announcement.enabled ? <ToggleRight className="w-6 h-6 text-green-400" /> : <ToggleLeft className="w-6 h-6" />}
                            </button>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2 space-y-2">
                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Banner Text</Label>
                                <Input className="bg-slate-950 border-slate-800 h-10" value={homepage.announcement.text}
                                    onChange={e => setHomepage({ ...homepage, announcement: { ...homepage.announcement, text: e.target.value } })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Color</Label>
                                <Input type="color" className="bg-slate-950 border-slate-800 h-10 w-full" value={homepage.announcement.color}
                                    onChange={e => setHomepage({ ...homepage, announcement: { ...homepage.announcement, color: e.target.value } })} />
                            </div>
                        </div>
                    </section>

                    {/* Testimonials */}
                    <section className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Testimonials</h2>
                            <Button variant="outline" size="sm" className="border-slate-800 text-xs" onClick={() => setHomepage({
                                ...homepage, testimonials: [...homepage.testimonials, { name: '', location: '', rating: 5, quote: '', date: new Date().toISOString().split('T')[0] }]
                            })}><Plus className="w-3 h-3 mr-1" /> Add</Button>
                        </div>
                        {homepage.testimonials.map((t, i) => (
                            <div key={i} className="grid grid-cols-4 gap-3 p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
                                <Input placeholder="Name" className="bg-slate-950 border-slate-800 h-9" value={t.name}
                                    onChange={e => { const arr = [...homepage.testimonials]; arr[i] = { ...arr[i], name: e.target.value }; setHomepage({ ...homepage, testimonials: arr }); }} />
                                <Input placeholder="Location" className="bg-slate-950 border-slate-800 h-9" value={t.location}
                                    onChange={e => { const arr = [...homepage.testimonials]; arr[i] = { ...arr[i], location: e.target.value }; setHomepage({ ...homepage, testimonials: arr }); }} />
                                <Input placeholder="Quote" className="bg-slate-950 border-slate-800 h-9 col-span-2" value={t.quote}
                                    onChange={e => { const arr = [...homepage.testimonials]; arr[i] = { ...arr[i], quote: e.target.value }; setHomepage({ ...homepage, testimonials: arr }); }} />
                            </div>
                        ))}
                    </section>
                </div>
            )}

            {/* About Tab */}
            {tab === 'About' && (
                <div className="space-y-6 bg-slate-900/30 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-primary">About Page</h2>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mission Statement</Label>
                        <textarea className="w-full min-h-[100px] bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-primary/50"
                            value={global.about.missionStatement} onChange={e => setGlobal({ ...global, about: { ...global.about, missionStatement: e.target.value } })} />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Company Story</Label>
                        <textarea className="w-full min-h-[200px] bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-primary/50"
                            value={global.about.companyStory} onChange={e => setGlobal({ ...global, about: { ...global.about, companyStory: e.target.value } })} />
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Team Members</Label>
                            <Button variant="outline" size="sm" className="border-slate-800 text-xs" onClick={() => setGlobal({
                                ...global, about: { ...global.about, teamMembers: [...global.about.teamMembers, { name: '', role: '', imageUrl: '', bio: '' }] }
                            })}><Plus className="w-3 h-3 mr-1" /> Add Member</Button>
                        </div>
                        {global.about.teamMembers.map((m, i) => (
                            <div key={i} className="grid grid-cols-3 gap-3 p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
                                <Input placeholder="Name" className="bg-slate-950 border-slate-800 h-9" value={m.name}
                                    onChange={e => { const arr = [...global.about.teamMembers]; arr[i] = { ...arr[i], name: e.target.value }; setGlobal({ ...global, about: { ...global.about, teamMembers: arr } }); }} />
                                <Input placeholder="Role" className="bg-slate-950 border-slate-800 h-9" value={m.role}
                                    onChange={e => { const arr = [...global.about.teamMembers]; arr[i] = { ...arr[i], role: e.target.value }; setGlobal({ ...global, about: { ...global.about, teamMembers: arr } }); }} />
                                <div className="flex gap-2">
                                    <Input placeholder="Image URL" className="bg-slate-950 border-slate-800 h-9 flex-1" value={m.imageUrl}
                                        onChange={e => { const arr = [...global.about.teamMembers]; arr[i] = { ...arr[i], imageUrl: e.target.value }; setGlobal({ ...global, about: { ...global.about, teamMembers: arr } }); }} />
                                    <button onClick={() => { const arr = global.about.teamMembers.filter((_, idx) => idx !== i); setGlobal({ ...global, about: { ...global.about, teamMembers: arr } }); }}
                                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Contact Tab */}
            {tab === 'Contact' && (
                <div className="space-y-6 bg-slate-900/30 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Contact Information</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone</Label>
                            <Input className="bg-slate-950 border-slate-800 h-12" value={global.contact.phone}
                                onChange={e => setGlobal({ ...global, contact: { ...global.contact, phone: e.target.value } })} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email</Label>
                            <Input className="bg-slate-950 border-slate-800 h-12" value={global.contact.email}
                                onChange={e => setGlobal({ ...global, contact: { ...global.contact, email: e.target.value } })} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">WhatsApp</Label>
                            <Input className="bg-slate-950 border-slate-800 h-12" value={global.contact.whatsapp}
                                onChange={e => setGlobal({ ...global, contact: { ...global.contact, whatsapp: e.target.value } })} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Address</Label>
                            <Input className="bg-slate-950 border-slate-800 h-12" value={global.contact.address}
                                onChange={e => setGlobal({ ...global, contact: { ...global.contact, address: e.target.value } })} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Map Latitude</Label>
                            <Input className="bg-slate-950 border-slate-800 h-12" value={global.contact.mapLat}
                                onChange={e => setGlobal({ ...global, contact: { ...global.contact, mapLat: e.target.value } })} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Map Longitude</Label>
                            <Input className="bg-slate-950 border-slate-800 h-12" value={global.contact.mapLng}
                                onChange={e => setGlobal({ ...global, contact: { ...global.contact, mapLng: e.target.value } })} />
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Tab */}
            {tab === 'Footer' && (
                <div className="space-y-6 bg-slate-900/30 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Footer Configuration</h2>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tagline</Label>
                        <Input className="bg-slate-950 border-slate-800 h-12" value={global.footer.tagline}
                            onChange={e => setGlobal({ ...global, footer: { ...global.footer, tagline: e.target.value } })} />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Copyright Text</Label>
                        <Input className="bg-slate-950 border-slate-800 h-12" value={global.footer.copyrightText}
                            onChange={e => setGlobal({ ...global, footer: { ...global.footer, copyrightText: e.target.value } })} />
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Footer Links</Label>
                            <Button variant="outline" size="sm" className="border-slate-800 text-xs" onClick={() => setGlobal({
                                ...global, footer: { ...global.footer, links: [...global.footer.links, { label: '', href: '' }] }
                            })}><Plus className="w-3 h-3 mr-1" /> Add Link</Button>
                        </div>
                        {global.footer.links.map((link, i) => (
                            <div key={i} className="flex gap-3 items-center">
                                <Input placeholder="Label" className="bg-slate-950 border-slate-800 h-9 flex-1" value={link.label}
                                    onChange={e => { const arr = [...global.footer.links]; arr[i] = { ...arr[i], label: e.target.value }; setGlobal({ ...global, footer: { ...global.footer, links: arr } }); }} />
                                <Input placeholder="/path or URL" className="bg-slate-950 border-slate-800 h-9 flex-1" value={link.href}
                                    onChange={e => { const arr = [...global.footer.links]; arr[i] = { ...arr[i], href: e.target.value }; setGlobal({ ...global, footer: { ...global.footer, links: arr } }); }} />
                                <button onClick={() => { const arr = global.footer.links.filter((_, idx) => idx !== i); setGlobal({ ...global, footer: { ...global.footer, links: arr } }); }}
                                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SEO Tab */}
            {tab === 'SEO' && (
                <div className="space-y-6 bg-slate-900/30 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-primary">SEO Defaults</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Title Format</Label>
                            <Input className="bg-slate-950 border-slate-800 h-12" placeholder="%s — Vualiku XP" value={global.seo.defaultTitleFormat}
                                onChange={e => setGlobal({ ...global, seo: { ...global.seo, defaultTitleFormat: e.target.value } })} />
                            <p className="text-[10px] text-slate-600">Use %s for page title placeholder</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Google Analytics ID</Label>
                            <Input className="bg-slate-950 border-slate-800 h-12" placeholder="G-XXXXXXXXXX" value={global.seo.googleAnalyticsId}
                                onChange={e => setGlobal({ ...global, seo: { ...global.seo, googleAnalyticsId: e.target.value } })} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Default Meta Description</Label>
                        <textarea className="w-full min-h-[80px] bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-primary/50"
                            value={global.seo.defaultDescription} onChange={e => setGlobal({ ...global, seo: { ...global.seo, defaultDescription: e.target.value } })} />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">OG Image URL</Label>
                        <Input className="bg-slate-950 border-slate-800 h-10" value={global.seo.ogImageUrl}
                            onChange={e => setGlobal({ ...global, seo: { ...global.seo, ogImageUrl: e.target.value } })} />
                    </div>
                </div>
            )}
        </div>
    );
}
