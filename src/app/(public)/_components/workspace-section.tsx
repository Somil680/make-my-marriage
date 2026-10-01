import Link from "next/link";
import { PreviewAction } from "./preview-action";
import { demoWedding } from "./landing-data";

export function WorkspaceSection() {
  return (
    <section className="w-full bg-landing-surface py-landing-space-xl" id="features">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="font-landing-eyebrow text-landing-eyebrow text-landing-secondary uppercase tracking-widest">
              {"Master Workspace"}
            </span>
            <h2 className="font-landing-headline-lg text-3xl sm:text-landing-headline-lg text-landing-on-surface mt-2">
              {"See your entire wedding at a glance."}
            </h2>
          </div>
          <p className="font-landing-body-md text-landing-body-md text-landing-on-surface-variant max-w-md">
            {" A calm wedding workspace. Keep plans together, with fewer scattered messages and mismatched spreadsheets. Illustrative preview with sample data."}
          </p>
        </div>
        <div className="w-full rounded-3xl bg-landing-surface-container-low shadow-xl p-4 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-[12px] bg-landing-primary-container text-landing-on-primary flex items-center justify-center font-bold">
                {"M&A"}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-landing-headline-sm text-landing-headline-sm text-landing-on-surface">
                    {demoWedding.title}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-landing-tertiary-fixed text-landing-on-tertiary-fixed font-landing-label-sm text-landing-label-sm font-semibold">
                    {"Active"}
                  </span>
                </div>
                <p className="font-landing-body-sm text-landing-body-sm text-landing-on-surface-variant">
                  {"Jaipur Grand Heritage · 63 Days Remaining · 5 Ceremonies"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center -space-x-1.5">
                <span className="w-8 h-8 rounded-full bg-landing-secondary-fixed text-landing-on-secondary-fixed text-xs font-semibold flex items-center justify-center" title="Mother (Guest approvals)">
                  {"MA"}
                </span>
                <span className="w-8 h-8 rounded-full bg-landing-tertiary-fixed text-landing-on-tertiary-fixed text-xs font-semibold flex items-center justify-center" title="Brother (Logistics)">
                  {"RA"}
                </span>
                <span className="w-8 h-8 rounded-full bg-landing-primary-fixed text-landing-primary text-xs font-semibold flex items-center justify-center" title="Planner (All Events)">
                  {"NP"}
                </span>
              </div>
              <PreviewAction kind="workspace" className="h-9 px-4 rounded-full bg-landing-surface text-landing-on-surface font-landing-label-md text-landing-label-md shadow-xs hover:bg-landing-surface-container flex items-center gap-1.5 transition-colors">
                <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
                  {"share"}
                </span>
                {" Share Access "}
              </PreviewAction>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-landing-surface shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-landing-on-surface-variant">
                <span className="font-landing-label-md text-landing-label-md uppercase tracking-wider">
                  {"Countdown"}
                </span>
                <span aria-hidden="true" className="material-symbols-outlined text-[20px] text-landing-secondary">
                  {"schedule"}
                </span>
              </div>
              <div className="mt-4">
                <p className="font-landing-headline-lg text-4xl font-semibold text-landing-on-surface">
                  {demoWedding.daysRemaining}
                  <span className="font-landing-body-md text-landing-body-md font-normal text-landing-on-surface-variant">
                    {"days"}
                  </span>
                </p>
                <p className="font-landing-body-sm text-landing-body-sm text-landing-secondary mt-1">
                  {"First event: Haldi (Dec 13)"}
                </p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-landing-surface shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-landing-on-surface-variant">
                <span className="font-landing-label-md text-landing-label-md uppercase tracking-wider">
                  {"Confirmed RSVPs"}
                </span>
                <span aria-hidden="true" className="material-symbols-outlined text-[20px] text-landing-secondary">
                  {"group"}
                </span>
              </div>
              <div className="mt-4">
                <p className="font-landing-headline-lg text-4xl font-semibold text-landing-on-surface">
                  {demoWedding.attending}
                  <span className="font-landing-body-md text-landing-body-md font-normal text-landing-on-surface-variant">
                    {"/ 480"}
                  </span>
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-full bg-landing-surface-container-highest h-1.5 rounded-full overflow-hidden">
                    <div className="bg-landing-secondary h-full rounded-full" style={{ "width": "87.5%" }}>

                    </div>
                  </div>
                  <span className="font-landing-label-sm text-landing-label-sm text-landing-on-surface-variant">
                    {"87%"}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-landing-surface shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-landing-on-surface-variant">
                <span className="font-landing-label-md text-landing-label-md uppercase tracking-wider">
                  {"Wedding Expenses"}
                </span>
                <span aria-hidden="true" className="material-symbols-outlined text-[20px] text-landing-secondary">
                  {"payments"}
                </span>
              </div>
              <div className="mt-4">
                <p className="font-landing-headline-lg text-3xl font-semibold text-landing-on-surface">
                  {demoWedding.spendLabel}
                  <span className="font-landing-body-md text-landing-body-md font-normal text-landing-on-surface-variant">
                    {"recorded spend"}
                  </span>
                </p>
                <p className="font-landing-body-sm text-landing-body-sm text-landing-on-surface-variant mt-1">
                  {"Across your wedding events and vendors"}
                </p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-landing-surface shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-landing-on-surface-variant">
                <span className="font-landing-label-md text-landing-label-md uppercase tracking-wider">
                  {"Action Items"}
                </span>
                <span aria-hidden="true" className="material-symbols-outlined text-[20px] text-landing-secondary">
                  {"checklist"}
                </span>
              </div>
              <div className="mt-4">
                <p className="font-landing-headline-lg text-4xl font-semibold text-landing-on-surface">
                  {demoWedding.completedTasks}
                  <span className="font-landing-body-md text-landing-body-md font-normal text-landing-on-surface-variant">
                    {"done / 68"}
                  </span>
                </p>
                <p className="font-landing-body-sm text-landing-body-sm text-landing-primary-container font-semibold mt-1">
                  {"6 critical due this weekend"}
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            <div className="lg:col-span-7 bg-landing-surface p-6 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-landing-headline-sm text-landing-headline-sm text-landing-on-surface">
                  {"Ceremonial Run-of-Show"}
                </h4>
                <Link href="#events" className="font-landing-label-sm text-landing-label-sm text-landing-secondary font-semibold cursor-pointer hover:underline">
                  {"View All Events"}
                </Link>
              </div>
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-[12px] bg-landing-surface-container-low flex items-center justify-between hover:bg-landing-surface-container transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[8px] bg-landing-secondary-container/50 text-landing-on-secondary-container flex items-center justify-center font-bold">
                      {"13"}
                    </div>
                    <div>
                      <p className="font-landing-label-md text-landing-label-md text-landing-on-surface">
                        {"Haldi & Welcome Lunch"}
                      </p>
                      <p className="font-landing-body-sm text-landing-body-sm text-landing-on-surface-variant">
                        {"11:00 AM · Zenana Bagh · 180 Guests"}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-landing-tertiary-fixed text-landing-on-tertiary-fixed font-landing-label-sm text-landing-label-sm">
                    {"Decor Ready"}
                  </span>
                </div>
                <div className="p-3.5 rounded-[12px] bg-landing-surface-container-low flex items-center justify-between hover:bg-landing-surface-container transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[8px] bg-landing-primary-fixed text-landing-primary flex items-center justify-center font-bold">
                      {"14"}
                    </div>
                    <div>
                      <p className="font-landing-label-md text-landing-label-md text-landing-on-surface">
                        {"Sangeet Extravaganza"}
                      </p>
                      <p className="font-landing-body-sm text-landing-body-sm text-landing-on-surface-variant">
                        {"7:30 PM · Grand Ballroom · 420 Guests"}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-landing-secondary-container text-landing-on-secondary-container font-landing-label-sm text-landing-label-sm">
                    {"Soundcheck 3 PM"}
                  </span>
                </div>
                <div className="p-3.5 rounded-[12px] bg-landing-surface-container-low flex items-center justify-between hover:bg-landing-surface-container transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[8px] bg-landing-surface-container-highest text-landing-on-surface flex items-center justify-center font-bold">
                      {"15"}
                    </div>
                    <div>
                      <p className="font-landing-label-md text-landing-label-md text-landing-on-surface">
                        {"Lagan & Vedic Pheras"}
                      </p>
                      <p className="font-landing-body-sm text-landing-body-sm text-landing-on-surface-variant">
                        {"4:00 PM · Lake Palace Mandap · 450 Guests"}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-landing-primary-fixed text-landing-primary font-landing-label-sm text-landing-label-sm">
                    {"Purohit Verified"}
                  </span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 bg-landing-surface p-6 rounded-2xl shadow-xs space-y-4">
              <h4 className="font-landing-headline-sm text-landing-headline-sm text-landing-on-surface">
                {"Collaborator Stream"}
              </h4>
              <div className="space-y-4 pt-1">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-landing-secondary-fixed text-landing-on-secondary-fixed text-xs font-bold flex items-center justify-center mt-0.5">
                    {"MA"}
                  </span>
                  <div className="flex-1">
                    <p className="font-landing-body-sm text-landing-body-sm text-landing-on-surface">
                      <span className="font-semibold">
                        {"Mother (Madhu)"}
                      </span>
                      {" confirmed 24 catering choices for Sunday Satvik lunch."}
                    </p>
                    <span className="font-landing-label-sm text-landing-label-sm text-landing-on-surface-variant">
                      {"14 mins ago"}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-landing-primary-fixed text-landing-primary text-xs font-bold flex items-center justify-center mt-0.5">
                    {"RA"}
                  </span>
                  <div className="flex-1">
                    <p className="font-landing-body-sm text-landing-body-sm text-landing-on-surface">
                      <span className="font-semibold">
                        {"Brother (Rohan)"}
                      </span>
                      {" confirmed the Sangeet rehearsal schedule with cousins."}
                    </p>
                    <span className="font-landing-label-sm text-landing-label-sm text-landing-on-surface-variant">
                      {"1 hour ago"}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-landing-tertiary-fixed text-landing-on-tertiary-fixed text-xs font-bold flex items-center justify-center mt-0.5">
                    {"NP"}
                  </span>
                  <div className="flex-1">
                    <p className="font-landing-body-sm text-landing-body-sm text-landing-on-surface">
                      <span className="font-semibold">
                        {"Nimisha Planners"}
                      </span>
                      {" uploaded signed Stage Rigging Contract (PDF)."}
                    </p>
                    <span className="font-landing-label-sm text-landing-label-sm text-landing-on-surface-variant">
                      {"3 hours ago"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
