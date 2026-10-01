

export function FamilySection() {
  return (
    <section className="w-full bg-landing-surface py-landing-space-xl" id="for-families">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="font-landing-eyebrow text-landing-eyebrow text-landing-secondary uppercase tracking-widest">
              {"Collaborative Harmony"}
            </span>
            <h2 className="font-landing-headline-lg text-3xl sm:text-landing-headline-lg text-landing-on-surface leading-snug">
              {"Planning a wedding takes a family. Control keeps it peaceful."}
            </h2>
            <p className="font-landing-body-md text-landing-body-md text-landing-on-surface-variant leading-relaxed">
              {" Invite parents, siblings, in-laws, and wedding planners into one calm workspace with granular visibility. Share guest lists without exposing vendor negotiation ledgers. "}
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="w-6 h-6 rounded-full bg-landing-tertiary-fixed text-landing-on-tertiary-fixed flex items-center justify-center material-symbols-outlined text-[14px]">
                  {"check"}
                </span>
                <span className="font-landing-body-md text-landing-body-md text-landing-on-surface">
                  {"Module permissions for parents, siblings, and planners"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="w-6 h-6 rounded-full bg-landing-tertiary-fixed text-landing-on-tertiary-fixed flex items-center justify-center material-symbols-outlined text-[14px]">
                  {"check"}
                </span>
                <span className="font-landing-body-md text-landing-body-md text-landing-on-surface">
                  {"Keep vendor contracts & expenses private to permitted organizers"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="w-6 h-6 rounded-full bg-landing-tertiary-fixed text-landing-on-tertiary-fixed flex items-center justify-center material-symbols-outlined text-[14px]">
                  {"check"}
                </span>
                <span className="font-landing-body-md text-landing-body-md text-landing-on-surface">
                  {"Assign ceremony tasks, rehearsals, and hamper delivery clearly"}
                </span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7 bg-landing-surface-container-low rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3">
              <p className="font-landing-label-lg text-landing-label-lg text-landing-on-surface">
                {"Family Roles & Granular Access"}
              </p>
              <span className="font-landing-eyebrow text-landing-eyebrow text-landing-secondary uppercase">
                {"3 Active Members"}
              </span>
            </div>
            <div className="p-4 rounded-[12px] bg-landing-surface shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-landing-primary-fixed text-landing-primary font-bold flex items-center justify-center">
                  {"M"}
                </span>
                <div>
                  <p className="font-landing-label-md text-landing-label-md text-landing-on-surface font-semibold">
                    {"Madhu Agrawal "}
                    <span className="text-landing-on-surface-variant font-normal">
                      {"(Mother of the Bride)"}
                    </span>
                  </p>
                  <p className="font-landing-body-sm text-landing-body-sm text-landing-on-surface-variant">
                    {"Assigned to: Catering menu, Mithai hampers, Bride-side guest list"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-[4px] bg-landing-secondary-container/40 text-landing-on-secondary-container text-xs font-semibold">
                  {"Guests ✓"}
                </span>
                <span className="px-2.5 py-1 rounded-[4px] bg-landing-secondary-container/40 text-landing-on-secondary-container text-xs font-semibold">
                  {"Tasks ✓"}
                </span>
                <span className="px-2.5 py-1 rounded-[4px] bg-landing-surface-container-highest text-landing-on-surface-variant text-xs">
                  {"Ledger Hidden"}
                </span>
              </div>
            </div>
            <div className="p-4 rounded-[12px] bg-landing-surface shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-landing-secondary-fixed text-landing-on-secondary-fixed font-bold flex items-center justify-center">
                  {"R"}
                </span>
                <div>
                  <p className="font-landing-label-md text-landing-label-md text-landing-on-surface font-semibold">
                    {"Rohan Kapoor "}
                    <span className="text-landing-on-surface-variant font-normal">
                      {"(Brother)"}
                    </span>
                  </p>
                  <p className="font-landing-body-sm text-landing-body-sm text-landing-on-surface-variant">
                    {"Assigned to: Sangeet choreography, Rehearsals, Sound & Light"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-[4px] bg-landing-secondary-container/40 text-landing-on-secondary-container text-xs font-semibold">
                  {"Guests ✓"}
                </span>
                <span className="px-2.5 py-1 rounded-[4px] bg-landing-secondary-container/40 text-landing-on-secondary-container text-xs font-semibold">
                  {"Tasks ✓"}
                </span>
                <span className="px-2.5 py-1 rounded-[4px] bg-landing-surface-container-highest text-landing-on-surface-variant text-xs">
                  {"Ledger Hidden"}
                </span>
              </div>
            </div>
            <div className="p-4 rounded-[12px] bg-landing-surface shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-landing-tertiary-fixed text-landing-on-tertiary-fixed font-bold flex items-center justify-center">
                  {"N"}
                </span>
                <div>
                  <p className="font-landing-label-md text-landing-label-md text-landing-on-surface font-semibold">
                    {"Nimisha Planners "}
                    <span className="text-landing-on-surface-variant font-normal">
                      {"(Wedding Planner)"}
                    </span>
                  </p>
                  <p className="font-landing-body-sm text-landing-body-sm text-landing-on-surface-variant">
                    {"Full operational execution, vendors, timeline coordination"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-[4px] bg-landing-secondary-container/40 text-landing-on-secondary-container text-xs font-semibold">
                  {"Guests ✓"}
                </span>
                <span className="px-2.5 py-1 rounded-[4px] bg-landing-secondary-container/40 text-landing-on-secondary-container text-xs font-semibold">
                  {"Vendors ✓"}
                </span>
                <span className="px-2.5 py-1 rounded-[4px] bg-landing-secondary-container/40 text-landing-on-secondary-container text-xs font-semibold">
                  {"Timeline ✓"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
