import Link from "next/link";
import { PreviewAction } from "./preview-action";
import { demoWedding } from "./landing-data";

export function WebsiteSection() {
  return (
    <section className="w-full bg-landing-surface-container-low py-landing-space-xl" id="wedding-website">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="font-landing-eyebrow text-landing-eyebrow text-landing-secondary uppercase tracking-widest">
            {"Bespoke Guest Destination"}
          </span>
          <h2 className="font-landing-headline-lg text-3xl sm:text-landing-headline-lg text-landing-on-surface mt-2">
            {"Your guests deserve a beautiful experience too."}
          </h2>
          <p className="font-landing-body-md text-landing-body-md text-landing-on-surface-variant mt-3">
            {" A private invitation website with family-specific events, venue map links, dress codes, and external livestream links for family overseas. "}
          </p>
        </div>
        <div className="relative w-full rounded-3xl bg-landing-surface p-6 sm:p-10 shadow-xl max-w-4xl mx-auto">
          <div className="flex items-center justify-between pb-8">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-landing-primary-container/20">

              </span>
              <span className="w-3 h-3 rounded-full bg-landing-secondary/20">

              </span>
              <span className="w-3 h-3 rounded-full bg-landing-tertiary/20">

              </span>
            </div>
            <span className="font-landing-eyebrow text-landing-eyebrow text-landing-on-surface-variant uppercase tracking-widest">
              {"Private wedding website · Preview"}
            </span>
            <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-landing-on-surface-variant">
              {"lock"}
            </span>
          </div>
          <div className="text-center space-y-4 py-8">
            <span className="font-landing-eyebrow text-landing-eyebrow text-landing-secondary uppercase tracking-widest">
              {"We are getting married"}
            </span>
            <h3 className="font-landing-headline-lg text-4xl sm:text-5xl text-landing-on-surface italic font-normal">
              {demoWedding.guestNames}
            </h3>
            <p className="font-landing-body-md text-landing-body-md text-landing-on-surface-variant">
              {demoWedding.guestDate}
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <PreviewAction kind="rsvp" className="h-11 px-6 rounded-full bg-landing-primary-container text-landing-on-primary font-landing-label-md text-landing-label-md shadow-xs">
                {" Confirm RSVP "}
              </PreviewAction>
              <Link href="#events" className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-landing-surface-container hover:bg-landing-surface-container-high text-landing-on-surface font-landing-label-md text-landing-label-md">
                {" View Itinerary & Dress Code "}
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t-0">
            <div className="p-4 rounded-[12px] bg-landing-surface-container-low text-center space-y-1">
              <span aria-hidden="true" className="material-symbols-outlined text-landing-secondary text-[22px]">
                {"event"}
              </span>
              <p className="font-landing-label-md text-landing-label-md text-landing-on-surface font-semibold">
                {"Venue Details"}
              </p>
              <p className="font-landing-body-sm text-landing-body-sm text-landing-on-surface-variant">
                {"Addresses and map links for your events"}
              </p>
            </div>
            <div className="p-4 rounded-[12px] bg-landing-surface-container-low text-center space-y-1">
              <span aria-hidden="true" className="material-symbols-outlined text-landing-secondary text-[22px]">
                {"checkroom"}
              </span>
              <p className="font-landing-label-md text-landing-label-md text-landing-on-surface font-semibold">
                {"Attire Lookbook"}
              </p>
              <p className="font-landing-body-sm text-landing-body-sm text-landing-on-surface-variant">
                {"Color palettes for 4 ceremonies"}
              </p>
            </div>
            <div className="p-4 rounded-[12px] bg-landing-surface-container-low text-center space-y-1">
              <span aria-hidden="true" className="material-symbols-outlined text-landing-secondary text-[22px]">
                {"videocam"}
              </span>
              <p className="font-landing-label-md text-landing-label-md text-landing-on-surface font-semibold">
                {"Livestream Links"}
              </p>
              <p className="font-landing-body-sm text-landing-body-sm text-landing-on-surface-variant">
                {"External event links for invited family"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
