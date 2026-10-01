import Link from "next/link";

export function ScopeSection() {
  return (
    <section className="w-full bg-landing-surface-container-low py-10" id="scope">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col items-center text-center">
        <span className="font-landing-eyebrow text-landing-eyebrow text-landing-secondary uppercase tracking-widest mb-3">
          {"Architected for clarity"}
        </span>
        <h2 className="font-landing-headline-md text-landing-headline-md text-landing-on-surface mb-6">
          {"One wedding. One beautifully organized place."}
        </h2>
        <div className="w-full overflow-x-auto pb-2 scrollbar-none flex items-center justify-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 p-2 rounded-full bg-landing-surface-container shadow-xs">
            <Link href="#events" className="px-5 py-2 rounded-full font-landing-label-md text-landing-label-md">
              {"Events"}
            </Link>
            <Link href="#guests" className="px-5 py-2 rounded-full hover:bg-landing-surface text-landing-on-surface-variant hover:text-landing-on-surface font-landing-label-md text-landing-label-md transition-colors cursor-pointer">
              {"Guests & RSVP"}
            </Link>
            <Link href="#how-it-works" className="px-5 py-2 rounded-full hover:bg-landing-surface text-landing-on-surface-variant hover:text-landing-on-surface font-landing-label-md text-landing-label-md transition-colors cursor-pointer bg-landing-surface text-landing-on-surface shadow-xs">
              {"Run-of-Show Tasks"}
            </Link>
            <Link href="#expenses" className="px-5 py-2 rounded-full hover:bg-landing-surface text-landing-on-surface-variant hover:text-landing-on-surface font-landing-label-md text-landing-label-md transition-colors cursor-pointer">
              {"Vendor Contracts"}
            </Link>
            <Link href="#expenses" className="px-5 py-2 rounded-full hover:bg-landing-surface text-landing-on-surface-variant hover:text-landing-on-surface font-landing-label-md text-landing-label-md transition-colors cursor-pointer">
              {"Rupee Ledger"}
            </Link>
            <Link href="#for-families" className="px-5 py-2 rounded-full hover:bg-landing-surface text-landing-on-surface-variant hover:text-landing-on-surface font-landing-label-md text-landing-label-md transition-colors cursor-pointer">
              {"Family Sharing"}
            </Link>
            <Link href="#wedding-website" className="px-5 py-2 rounded-full hover:bg-landing-surface text-landing-on-surface-variant hover:text-landing-on-surface font-landing-label-md text-landing-label-md transition-colors cursor-pointer">
              {"Wedding Website"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
