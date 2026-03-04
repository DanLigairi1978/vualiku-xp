import { OperatorOnboardingForm } from '@/components/operator/onboarding-form';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export default function JoinPage() {
    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <div className="fixed inset-0 misty-bg opacity-30 pointer-events-none" />

            <Header />

            <main className="container mx-auto px-6 py-24 relative z-10 animate-in fade-in duration-1000">
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-5xl md:text-7xl font-bold font-tahoma text-white tracking-tighter">
                        Grow with <span className="text-primary italic">Vualiku XP</span>
                    </h1>
                    <p className="text-xl text-foreground/40 font-light max-w-2xl mx-auto italic">
                        The premier booking platform for sustainable tourism in the North.
                    </p>
                </div>

                <OperatorOnboardingForm />

                <section className="mt-32 max-w-4xl mx-auto grid md:grid-cols-3 gap-12 text-center pb-24 border-t border-white/5 pt-24">
                    <div className="space-y-4">
                        <div className="text-primary text-3xl font-bold">Global Reach</div>
                        <p className="text-sm text-foreground/50 font-light leading-relaxed">Access international travelers directly through our streamlined booking engine.</p>
                    </div>
                    <div className="space-y-4">
                        <div className="text-primary text-3xl font-bold">Secure Escrow</div>
                        <p className="text-sm text-foreground/50 font-light leading-relaxed">Ensuring fair and immediate payments for operators and community cooperatives.</p>
                    </div>
                    <div className="space-y-4">
                        <div className="text-primary text-3xl font-bold">Unified Inbox</div>
                        <p className="text-sm text-foreground/50 font-light leading-relaxed">Integrated WhatsApp, Viber, and Messenger tools for seamless guest management.</p>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
