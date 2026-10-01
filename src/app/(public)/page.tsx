import type { Metadata } from "next";
import { LandingHeader } from "./_components/landing-header";
import { HeroSection } from "./_components/hero-section";
import { ScopeSection } from "./_components/scope-section";
import { WorkspaceSection } from "./_components/workspace-section";
import { EventsSection } from "./_components/events-section";
import { FamilySection } from "./_components/family-section";
import { GuestsSection } from "./_components/guests-section";
import { ExpensesSection } from "./_components/expenses-section";
import { WebsiteSection } from "./_components/website-section";
import { ProcessSection } from "./_components/process-section";
import { TraditionsSection } from "./_components/traditions-section";
import { CelebrationSection } from "./_components/celebration-section";
import { LandingFooter } from "./_components/landing-footer";

export const metadata: Metadata = {
  title: "Your wedding, beautifully together",
  description: "Plan every event, guest, task, vendor, and expense with your family. A calm, collaborative wedding workspace built for multi-day Indian weddings.",
};

export default function HomePage() {
  return (
    <div className="landing-page bg-landing-surface font-landing-body-md text-landing-on-surface antialiased">
      <a href="#main-content" className="landing-skip-link">Skip to content</a>
      <LandingHeader />
      <main id="main-content" className="w-full pt-24" tabIndex={-1}>
        <HeroSection />
        <ScopeSection />
        <WorkspaceSection />
        <EventsSection />
        <FamilySection />
        <GuestsSection />
        <ExpensesSection />
        <WebsiteSection />
        <ProcessSection />
        <TraditionsSection />
        <CelebrationSection />
      </main>
      <LandingFooter />
    </div>
  );
}
