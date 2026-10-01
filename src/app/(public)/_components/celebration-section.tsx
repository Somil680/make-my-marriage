import Link from "next/link";

export function CelebrationSection() {
  return (
    <section className="w-full bg-landing-surface py-landing-space-xl" id="start-planning">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        <div className="relative overflow-hidden rounded-3xl bg-landing-primary-container p-8 sm:p-16 text-center text-landing-on-primary shadow-2xl">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-landing-primary/40 blur-3xl pointer-events-none">

          </div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-landing-secondary/30 blur-3xl pointer-events-none">

          </div>
          <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto space-y-6">
            <span className="px-4 py-1.5 rounded-full bg-landing-on-primary/10 text-landing-primary-fixed font-landing-eyebrow text-landing-eyebrow uppercase tracking-widest">
              {" Begin Your Celebration "}
            </span>
            <h2 className="font-landing-headline-lg text-4xl sm:text-5xl text-white font-semibold leading-tight">
              {" Plan the celebration. "}
              <br />
              <span className="italic font-normal text-landing-secondary-container">
                {"Enjoy every single moment."}
              </span>
            </h2>
            <p className="font-landing-body-lg text-landing-body-lg text-landing-surface-container-high/90 max-w-xl leading-relaxed">
              {" Bring your family together to plan an unforgettable multi-day Indian wedding with a little more clarity and a lot more joy. "}
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
              <Link href="/signup" className="h-14 px-9 rounded-full bg-white text-landing-primary font-landing-label-lg text-lg shadow-xl hover:bg-landing-surface-container transition-all flex items-center justify-center gap-2 w-full sm:w-auto">
                <span className="">
                  {"Create Your Wedding"}
                </span>
                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                  {"arrow_forward"}
                </span>
              </Link>
              <Link href="#features" className="h-14 px-8 rounded-full border border-white/20 hover:bg-white/10 text-white font-landing-label-lg text-base transition-all flex items-center justify-center w-full sm:w-auto">
                {" Explore the Workspace "}
              </Link>
            </div>
            <p className="text-xs text-landing-on-primary-container/80 pt-2">
              {" One shared workspace · Made for both families "}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
