'use client';

import { useState } from 'react';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, Send, Loader2, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSiteContent } from '@/hooks/useSiteContent';

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { global } = useSiteContent();
  const { contact } = global;

  // The deployed Apps Script URL provided by the user
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxeaKs9Z9SnkjV_eFC3jA7x5nxhd93ogyrOMurtcIjA144IVlA68p46w2BNz7D4P2NWHw/exec";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      company: formData.get('company'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message'),
    };

    try {
      await fetch(WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(data),
      });

      toast({
        title: "Message Sent!",
        description: "Your inquiry has been received. Our team will be in touch shortly.",
      });

      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast({
        title: "Message Failed",
        description: "There was an error sending your message. Please try again or use direct email.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen text-white pt-32 pb-24 overflow-hidden selection:bg-primary/30">
      {/* Misty Background Layer */}
      <div className="fixed inset-0 misty-bg opacity-70 pointer-events-none" />

      <div className="container relative z-10 mx-auto max-w-4xl px-6">
        <div className="forest-card overflow-hidden">
          <CardHeader className="text-center space-y-4 pb-12 border-b border-white/5">
            <CardTitle className="text-5xl md:text-6xl font-bold font-tahoma text-shadow-lg">Get In Touch</CardTitle>
            <CardDescription className="text-xl text-foreground/60 font-light">
              We&apos;d love to hear from you. Here&apos;s how you can reach our team.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-12 pt-12">
            <div className="space-y-10">
              <div className="flex items-start gap-6 group">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-background transition-all duration-300">
                  <Mail className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold font-tahoma">Email</h3>
                  <p className="text-foreground/60 text-sm leading-relaxed">For general inquiries and booking support.</p>
                  <a href={`mailto:${contact.email}`} className="block text-lg font-medium text-primary hover:underline underline-offset-4">
                    {contact.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-background transition-all duration-300">
                  <Phone className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold font-tahoma">Phone</h3>
                  <p className="text-foreground/60 text-sm leading-relaxed">Available during local business hours (FJT).</p>
                  <a href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`} className="block text-lg font-medium text-primary hover:underline underline-offset-4">
                    {contact.phone}
                  </a>
                </div>
              </div>

              {contact.whatsapp && (
                <div className="flex items-start gap-6 group">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-500/10 text-green-400 border border-green-500/20 group-hover:bg-green-500 group-hover:text-background transition-all duration-300">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold font-tahoma">WhatsApp</h3>
                    <p className="text-foreground/60 text-sm leading-relaxed">Chat with us instantly.</p>
                    <a href={`https://wa.me/${contact.whatsapp.replace(/[^+\d]/g, '')}`} target="_blank" rel="noopener noreferrer" className="block text-lg font-medium text-green-400 hover:underline underline-offset-4">
                      {contact.whatsapp}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-6 group">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-background transition-all duration-300">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold font-tahoma">Our Headquarters</h3>
                  <p className="text-lg text-foreground/80 leading-relaxed font-light">
                    {contact.address}
                    <br />
                    <span className="text-sm text-foreground/40 italic">(Visits by appointment only)</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Form Section */}
            <div className="forest-card bg-black/40 border border-white/10 p-8 rounded-3xl backdrop-blur-xl">
              <h3 className="text-2xl font-bold font-tahoma text-white mb-6">Message Us</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-primary ml-1">Full Name *</label>
                    <Input name="name" required placeholder="John Doe" className="bg-white/5 border-white/10 h-12 rounded-xl text-white placeholder:text-white/30" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-primary ml-1">Company / Organization</label>
                    <Input name="company" placeholder="Optional" className="bg-white/5 border-white/10 h-12 rounded-xl text-white placeholder:text-white/30" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-primary ml-1">Email Contact *</label>
                    <Input type="email" name="email" required placeholder="john@example.com" className="bg-white/5 border-white/10 h-12 rounded-xl text-white placeholder:text-white/30" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-primary ml-1">Phone Number</label>
                    <Input type="tel" name="phone" placeholder="+679 123 4567" className="bg-white/5 border-white/10 h-12 rounded-xl text-white placeholder:text-white/30" />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-sm font-bold text-primary ml-1">Your Message *</label>
                  <Textarea
                    name="message"
                    required
                    placeholder="How can we assist with your upcoming adventure?"
                    className="bg-white/5 border-white/10 min-h-[120px] rounded-xl text-white placeholder:text-white/30 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-forest h-14 mt-6 text-lg font-bold rounded-xl shadow-xl flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" /> Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </CardContent>
        </div>
      </div>
    </div>
  );
}
