import { Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
            <div className="md:col-span-1">
                 <h3 className="text-lg font-bold text-white mb-2 font-headline">Vualiku XP</h3>
                 <p className="text-sm text-slate-400">Your gateway to authentic Fiji.</p>
            </div>
            
            <div className="md:col-span-1">
                <h3 className="text-lg font-bold text-white mb-2 font-headline">Contact</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <a href="mailto:admin@vualikuxp.com" className="hover:text-white">admin@vualikuxp.com</a>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <a href="tel:+6797630785" className="hover:text-white">(679) 7630785</a>
                  </div>
                </div>
            </div>
        </div>
        <div className="mt-8 border-t border-slate-700 pt-6 text-center text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} The Meridian Solutions Company. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
