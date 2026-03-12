'use client';

import { ChatWidget } from '@/components/landing/ChatWidget';
import { AICapabilitiesSection } from '@/components/marketing/ai-capabilities-section';
import { ArchitectureSection } from '@/components/marketing/architecture-section';
import { Benefits } from '@/components/marketing/benefits';
import { DealerSolicitudesSection } from '@/components/marketing/dealer-solicitudes-section';
import { DemoForm } from '@/components/marketing/demo-form';
import { FloatingCTA } from '@/components/marketing/floating-cta';
import { Footer } from '@/components/marketing/footer';
import { Header } from '@/components/marketing/header';
import { HeroSection } from '@/components/marketing/hero-section';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { LanguageProvider } from '@/components/marketing/language-context';
import { ProblemSection } from '@/components/marketing/problem-section';
import { ProposalSection } from '@/components/marketing/proposal-section';
import { ResultsSection } from '@/components/marketing/results-section';
import { TargetAudienceSection } from '@/components/marketing/target-audience-section';
import { VideoSection } from '@/components/marketing/video-section';
import { useAuth } from '@/contexts/AuthContext';
import { resolvePostLoginRoute } from '@/lib/auth/postLoginRouting';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push(resolvePostLoginRoute(user));
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-white">
        <Header />
        <main>
          <HeroSection />
          <Benefits />
          <ProblemSection />
          <ProposalSection />
          <HowItWorks />
          <AICapabilitiesSection />
          <TargetAudienceSection />
          <ResultsSection />
          <ArchitectureSection />
          <VideoSection />
          <DealerSolicitudesSection />
          <DemoForm />
        </main>
        <Footer />
        {!user && <FloatingCTA />}
        {!user && <ChatWidget position="bottom-right" />}
      </div>
    </LanguageProvider>
  );
}
