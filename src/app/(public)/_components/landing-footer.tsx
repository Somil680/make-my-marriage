import Link from "next/link";
import Image from "next/image";
import { PreviewAction } from "./preview-action";

export function LandingFooter() {
  return (
    <footer className="w-full bg-landing-surface-container-low">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-landing-space-xl pb-landing-space-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-landing-space-xl pb-landing-space-xl">
          <div className="lg:col-span-2 space-y-landing-space-md">
            <div className="flex items-center gap-landing-space-sm">
              <Link href="#home" className="flex items-center">
                <Image src="/landing/wordmark.svg" width={240} height={50} alt="Make My Marriage" className="h-8 w-auto object-contain" />
              </Link>
            </div>
            <p className="font-landing-body-md text-landing-body-md text-landing-on-surface-variant max-w-sm">
              {"Made for celebrations that bring families together. An editorial sanctuary for collaborative Indian wedding curation."}
            </p>
          </div>
          <div>
            <h4 className="font-landing-label-lg text-landing-label-lg text-landing-primary uppercase tracking-wider mb-landing-space-md">
              {"Product"}
            </h4>
            <ul className="space-y-landing-space-sm">
              <li className="leading-none">
                <Link href="#features" className="font-landing-body-md text-landing-body-md text-landing-on-surface-variant hover:text-landing-on-surface transition-colors">
                  {"Features"}
                </Link>
              </li>
              <li className="leading-none">
                <Link href="#wedding-website" className="font-landing-body-md text-landing-body-md text-landing-on-surface-variant hover:text-landing-on-surface transition-colors">
                  {"Wedding Website"}
                </Link>
              </li>
              <li className="leading-none">
                <Link href="#guests" className="font-landing-body-md text-landing-body-md text-landing-on-surface-variant hover:text-landing-on-surface transition-colors">
                  {"Guest Management"}
                </Link>
              </li>
              <li className="leading-none">
                <Link href="#events" className="font-landing-body-md text-landing-body-md text-landing-on-surface-variant hover:text-landing-on-surface transition-colors">
                  {"Timelines"}
                </Link>
              </li>
              <li className="leading-none">
                <Link href="#expenses" className="font-landing-body-md text-landing-body-md text-landing-on-surface-variant hover:text-landing-on-surface transition-colors">
                  {"Expense Tracker"}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-landing-label-lg text-landing-label-lg text-landing-primary uppercase tracking-wider mb-landing-space-md">
              {"Company"}
            </h4>
            <ul className="space-y-landing-space-sm">
              <li className="leading-none">
                <Link href="#traditions" className="font-landing-body-md text-landing-body-md text-landing-on-surface-variant hover:text-landing-on-surface transition-colors">
                  {"About"}
                </Link>
              </li>
              <li className="leading-none">
                <Link href="#how-it-works" className="font-landing-body-md text-landing-body-md text-landing-on-surface-variant hover:text-landing-on-surface transition-colors">
                  {"Planning Guide"}
                </Link>
              </li>
              <li className="leading-none">
                <PreviewAction kind="contact" className="font-landing-body-md text-landing-body-md text-landing-on-surface-variant hover:text-landing-on-surface transition-colors">
                  {"Contact"}
                </PreviewAction>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-landing-label-lg text-landing-label-lg text-landing-primary uppercase tracking-wider mb-landing-space-md">
              {"Legal"}
            </h4>
            <ul className="space-y-landing-space-sm">
              <li className="leading-none">
                <PreviewAction kind="privacy-policy" className="font-landing-body-md text-landing-body-md text-landing-on-surface-variant hover:text-landing-on-surface transition-colors">
                  {"Privacy Policy"}
                </PreviewAction>
              </li>
              <li className="leading-none">
                <PreviewAction kind="terms-of-service" className="font-landing-body-md text-landing-body-md text-landing-on-surface-variant hover:text-landing-on-surface transition-colors">
                  {"Terms of Service"}
                </PreviewAction>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-landing-space-lg flex flex-col sm:flex-row items-center justify-between gap-landing-space-md">
          <p className="font-landing-body-sm text-landing-body-sm text-landing-on-surface-variant">
            {"© 2026 Make My Marriage. All rights reserved."}
          </p>
          <div className="flex items-center gap-landing-space-md text-landing-on-surface-variant">
            <Link href="#start-planning" aria-label="Start planning your wedding" className="hover:text-landing-on-surface transition-colors p-1">
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                {"share"}
              </span>
            </Link>
            <Link href="#for-families" aria-label="Explore family collaboration" className="hover:text-landing-on-surface transition-colors p-1">
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                {"mail"}
              </span>
            </Link>
            <Link href="#wedding-website" aria-label="Explore wedding websites" className="hover:text-landing-on-surface transition-colors p-1">
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                {"public"}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
