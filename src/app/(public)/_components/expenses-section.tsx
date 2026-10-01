import { demoWedding } from "./landing-data";

export function ExpensesSection() {
  return (
    <section className="w-full bg-landing-surface py-landing-space-xl" id="expenses">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 bg-landing-surface-container-low rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="font-landing-eyebrow text-landing-eyebrow text-landing-secondary uppercase">
                  {"Vendor Expense Tracker"}
                </span>
                <h3 className="font-landing-headline-sm text-landing-headline-sm text-landing-on-surface mt-1">
                  {"Vendor Contracts & Outstandings"}
                </h3>
              </div>
              <div className="text-right">
                <span className="font-landing-label-sm text-landing-label-sm text-landing-on-surface-variant">
                  {"Agreed Vendor Amounts"}
                </span>
                <p className="font-landing-headline-sm text-landing-headline-sm text-landing-primary-container">
                  {demoWedding.agreedLabel}
                </p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-landing-surface shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className="w-10 h-10 rounded-[12px] bg-landing-primary-fixed text-landing-primary flex items-center justify-center material-symbols-outlined text-[20px]">
                    {"photo_camera"}
                  </span>
                  <div>
                    <p className="font-landing-label-md text-landing-label-md text-landing-on-surface font-semibold">
                      {"Royal Heritage Visuals (Photography)"}
                    </p>
                    <p className="font-landing-body-sm text-landing-body-sm text-landing-on-surface-variant">
                      {"Total: ₹3,50,000 · 3-Day Cinematic & Drone"}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-landing-secondary-container text-landing-on-secondary-container font-landing-label-sm text-landing-label-sm font-semibold">
                  {" Partly Paid "}
                </span>
              </div>
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs text-landing-on-surface-variant">
                  <span className="">
                    {"Advance: ₹1,00,000 (Paid)"}
                  </span>
                  <span className="">
                    {"Remaining: ₹2,50,000"}
                  </span>
                  <span className="">
                    {"Linked expense recorded"}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-landing-surface-container-highest overflow-hidden flex">
                  <div className="h-full bg-landing-primary-container" style={{ "width": "28.5%" }}>

                  </div>
                  <div className="h-full bg-landing-secondary-fixed" style={{ "width": "42.8%" }}>

                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-landing-surface shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className="w-10 h-10 rounded-[12px] bg-landing-tertiary-fixed text-landing-on-tertiary-fixed flex items-center justify-center material-symbols-outlined text-[20px]">
                    {"palette"}
                  </span>
                  <div>
                    <p className="font-landing-label-md text-landing-label-md text-landing-on-surface font-semibold">
                      {"Floral Art & Stage Design by Vivan"}
                    </p>
                    <p className="font-landing-body-sm text-landing-body-sm text-landing-on-surface-variant">
                      {"Total: ₹14,00,000 · Mandap, Sangeet Stage & Entrance"}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-landing-tertiary-fixed text-landing-on-tertiary-fixed font-landing-label-sm text-landing-label-sm font-semibold">
                  {" Advance Cleared "}
                </span>
              </div>
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs text-landing-on-surface-variant">
                  <span className="">
                    {"Paid: ₹7,00,000 (50%)"}
                  </span>
                  <span className="">
                    {"Remaining: ₹7,00,000"}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-landing-surface-container-highest overflow-hidden">
                  <div className="h-full bg-landing-tertiary" style={{ "width": "50%" }}>

                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <span className="font-landing-eyebrow text-landing-eyebrow text-landing-secondary uppercase tracking-widest">
              {"Financial Poise"}
            </span>
            <h2 className="font-landing-headline-lg text-3xl sm:text-landing-headline-lg text-landing-on-surface leading-tight">
              {"Know where every single rupee went."}
            </h2>
            <p className="font-landing-body-lg text-landing-body-lg text-landing-on-surface-variant leading-relaxed">
              {" Keep every recorded payment in view. Track advances, expenses, and remaining vendor balances across your wedding events, caterers, and decorators. "}
            </p>
            <div className="p-4 rounded-2xl bg-landing-surface-container-high/50 space-y-2">
              <p className="font-landing-label-md text-landing-label-md text-landing-on-surface font-semibold">
                {"One payment. One expense record."}
              </p>
              <p className="font-landing-body-sm text-landing-body-sm text-landing-on-surface-variant">
                {" Vendor payments are recorded as expenses, so your family can see what was paid without counting it twice. "}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
