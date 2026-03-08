'use client';

import { Mail, Phone } from 'lucide-react';
import { useSiteContent } from '@/hooks/useSiteContent';

export default function Footer() {
  const { global } = useSiteContent();
  const { footer, contact } = global;

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold text-white mb-2 font-headline">Vualiku XP</h3>
            <p className="text-sm text-slate-400">{footer.tagline}</p>
          </div>

          <div className="md:col-span-1">
            <h3 className="text-lg font-bold text-white mb-2 font-headline">Contact</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <a href={`mailto:${contact.email}`} className="hover:text-white">{contact.email}</a>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <a href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`} className="hover:text-white">{contact.phone}</a>
              </div>
            </div>
          </div>

          {footer.links.length > 0 && (
            <div className="md:col-span-1">
              <h3 className="text-lg font-bold text-white mb-2 font-headline">Links</h3>
              <div className="space-y-1 text-sm">
                {footer.links.map((link, i) => (
                  <a key={i} href={link.href} className="block hover:text-white">{link.label}</a>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="mt-8 border-t border-slate-700 pt-6 text-center text-sm text-slate-400">
          <p>{footer.copyrightText}</p>
        </div>
      </div>
    </footer>
  );
}
