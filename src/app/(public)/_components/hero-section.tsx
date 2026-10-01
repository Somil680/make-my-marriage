import Link from "next/link";
import Image from "next/image";
import { demoWedding } from "./landing-data";

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-landing-surface pt-landing-space-xl pb-landing-margin" id="home">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col items-start z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-landing-secondary-container/40 text-landing-on-secondary-container">
              <span className="w-2 h-2 rounded-full bg-landing-secondary">

              </span>
              <span className="font-landing-eyebrow text-landing-eyebrow uppercase tracking-widest">
                {"Built for multi-day Indian weddings"}
              </span>
            </div>
            <h1 className="font-landing-headline-lg text-4xl sm:text-5xl lg:text-[64px] font-semibold text-landing-on-surface tracking-tight leading-[1.1] mt-6">
              {" Your wedding has hundreds of moving parts. Keep them "}
              <span className="italic font-normal text-landing-primary-container">
                {"beautifully together"}
              </span>
              {". "}
            </h1>
            <p className="font-landing-body-lg text-landing-body-lg text-landing-on-surface-variant max-w-2xl leading-relaxed mt-6">
              {" Plan every event, guest, task, vendor, and expense with your family—all from one calm, collaborative sanctuary built for Indian grandeur. "}
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-8 sm:mt-10">
              <Link href="/signup" className="h-14 px-9 rounded-full bg-landing-primary-container text-landing-on-primary font-landing-label-lg text-base shadow-[0_4px_16px_rgba(88,28,38,0.22)] hover:bg-landing-primary transition-all flex items-center justify-center gap-2 group">
                <span className="">
                  {"Plan Your Wedding"}
                </span>
                <span aria-hidden="true" className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">
                  {"arrow_forward"}
                </span>
              </Link>
              <Link href="#features" className="h-14 px-8 rounded-full bg-landing-surface-container-high/60 hover:bg-landing-surface-container-highest text-landing-on-surface font-landing-label-lg text-base transition-all flex items-center justify-center gap-2">
                <span className="">
                  {"Explore Features"}
                </span>
                <span aria-hidden="true" className="material-symbols-outlined text-[20px] text-landing-on-surface-variant">
                  {"keyboard_arrow_down"}
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-10 pt-8 border-t-0">
              <div className="flex -space-x-2.5">
                <span className="w-8 h-8 rounded-full bg-landing-secondary-container flex items-center justify-center text-xs font-semibold text-landing-on-secondary-container ring-2 ring-landing-surface">
                  {"RM"}
                </span>
                <span className="w-8 h-8 rounded-full bg-landing-primary-fixed flex items-center justify-center text-xs font-semibold text-landing-primary ring-2 ring-landing-surface">
                  {"AK"}
                </span>
                <span className="w-8 h-8 rounded-full bg-landing-tertiary-fixed flex items-center justify-center text-xs font-semibold text-landing-tertiary ring-2 ring-landing-surface">
                  {"SK"}
                </span>
                <span className="w-8 h-8 rounded-full bg-landing-surface-container-highest flex items-center justify-center text-xs font-bold text-landing-on-surface-variant ring-2 ring-landing-surface">
                  {"+You"}
                </span>
              </div>
              <p className="font-landing-body-sm text-landing-body-sm text-landing-on-surface-variant">
                {" Made for couples & families across Delhi, Mumbai, Udaipur & Bengaluru "}
              </p>
            </div>
          </div>
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] bg-landing-surface-container">
              <Image src="/landing/wedding-couple.png" width={512} height={279} priority sizes="(min-width: 1024px) 460px, 100vw" alt="A bride and groom celebrating in a sunlit Indian heritage courtyard" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-landing-on-background/70 via-transparent to-transparent">

              </div>
              <div className="absolute bottom-6 left-6 right-6 text-landing-on-primary">
                <span className="font-landing-eyebrow text-landing-eyebrow uppercase tracking-widest text-landing-secondary-container">
                  {"Heritage Grandeur"}
                </span>
                <h3 className="font-landing-headline-sm text-landing-headline-sm text-white mt-1">
                  {demoWedding.coupleLabel}
                </h3>
                <p className="font-landing-body-sm text-landing-body-sm text-landing-surface-container-high/90">
                  {demoWedding.heroVenue}
                </p>
              </div>
            </div>
            <div className="absolute -bottom-8 -left-6 sm:-left-10 w-[92%] sm:w-[360px] p-5 rounded-2xl bg-landing-surface/95 backdrop-blur-xl shadow-xl shadow-landing-on-surface/10 space-y-3.5">
              <div className="flex items-center justify-between pb-3">
                <div>
                  <span className="font-landing-label-sm text-landing-label-sm text-landing-secondary uppercase tracking-wider">
                    {"Agrawal & Kapoor"}
                  </span>
                  <p className="font-landing-headline-sm text-landing-headline-sm text-landing-on-surface leading-tight">
                    {`${demoWedding.daysRemaining} Days to Go`}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-landing-secondary-container/50 text-landing-on-secondary-container font-landing-label-sm text-landing-label-sm">
                  {" Palace Wedding "}
                </span>
              </div>
              <div className="p-3 rounded-[12px] bg-landing-surface-container-low flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className="w-8 h-8 rounded-full bg-landing-primary-container text-landing-on-primary flex items-center justify-center material-symbols-outlined text-[18px]">
                    {"event"}
                  </span>
                  <div>
                    <p className="font-landing-label-md text-landing-label-md text-landing-on-surface">
                      {"Next: Sangeet Night"}
                    </p>
                    <p className="font-landing-body-sm text-landing-body-sm text-landing-on-surface-variant">
                      {"Dec 14 · Fairmont Courtyard"}
                    </p>
                  </div>
                </div>
                <span className="font-landing-label-sm text-landing-label-sm text-landing-primary-container font-semibold">
                  {"8:00 PM"}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-landing-label-sm font-landing-label-sm text-landing-on-surface-variant">
                  <span className="">
                    {`${demoWedding.attending} / ${demoWedding.invited} RSVPs Confirmed`}
                  </span>
                  <span className="text-landing-on-surface font-semibold">
                    {"87%"}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-landing-surface-container-highest overflow-hidden">
                  <div className="h-full bg-landing-primary-container rounded-full" style={{ "width": "87.5%" }}>

                  </div>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between text-landing-label-sm font-landing-label-sm">
                <span className="flex items-center gap-1.5 text-landing-secondary">
                  <span className="w-2 h-2 rounded-full bg-landing-secondary">

                  </span>
                  {" 84% Tasks on Track "}
                </span>
                <span className="text-landing-on-surface-variant font-medium">
                  {"Expenses in One Place"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
