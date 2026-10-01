"use client";

import Link from "next/link";
import { useState } from "react";
import { demoFamilies } from "./landing-data";
import { PreviewAction } from "./preview-action";

export function GuestsSection() {
  const [pendingOnly, setPendingOnly] = useState(false);
  const families = pendingOnly ? demoFamilies.filter((family) => family.pending) : demoFamilies;

  return <section id="guests" className="w-full bg-landing-surface-container-low py-landing-space-xl">
    <div className="mx-auto max-w-7xl px-6 lg:px-12">
      <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div><span className="font-landing-eyebrow text-landing-eyebrow uppercase tracking-widest text-landing-secondary">Intelligent Guest Suites</span><h2 className="mt-2 font-landing-headline-lg text-3xl text-landing-on-surface sm:text-landing-headline-lg">Invite families beautifully. Know exactly who&apos;s coming.</h2></div>
        <p className="max-w-md font-landing-body-md text-landing-body-md text-landing-on-surface-variant">Invite the whole family, with individual attendance for each event. Keep households, guest lists, and multi-event RSVPs beautifully organized.</p>
      </div>
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="min-w-0 space-y-4 rounded-3xl bg-landing-surface p-6 shadow-xs lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
            <div className="flex flex-wrap items-center gap-3"><span className="font-landing-label-lg text-landing-label-lg">Household Guest Ledger</span><span role="status" className="rounded-full bg-landing-surface-container-high px-2.5 py-0.5 text-xs text-landing-on-surface-variant">{pendingOnly ? "Filtered: Awaiting RSVP" : "Sample guest families"}</span></div>
            <div className="flex items-center gap-2">
              <button type="button" aria-pressed={pendingOnly} onClick={() => setPendingOnly(!pendingOnly)} className="flex items-center gap-1 rounded-[8px] bg-landing-surface-container-low px-3 py-1.5 text-xs font-semibold hover:bg-landing-surface-container"><span aria-hidden="true" className="material-symbols-outlined text-[16px]">filter_list</span>{pendingOnly ? "Show All" : "Filter Pending"}</button>
              <Link href="/signup" className="flex items-center gap-1 rounded-[8px] bg-landing-primary-container px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-landing-primary"><span aria-hidden="true" className="material-symbols-outlined text-[16px]">add</span>Add Household</Link>
            </div>
          </div>
          <div role="region" aria-label="Sample guest families table, scroll horizontally on small screens" tabIndex={0} className="w-full overflow-x-auto">
            <table className="w-full min-w-[640px] text-left font-landing-body-sm text-sm">
              <caption className="sr-only">Illustrative guest families and event attendance</caption>
              <thead><tr className="text-xs uppercase tracking-wider text-landing-on-surface-variant">{["Household / Primary", "Members", "Ceremonies", "Invitation", "RSVP Status"].map((title) => <th key={title} scope="col" className="px-4 py-3">{title}</th>)}</tr></thead>
              <tbody>{families.map((family) => <tr key={family.id} className="transition-colors hover:bg-landing-surface-container-low">
                <th scope="row" className="px-4 py-3.5 font-normal"><p className="font-semibold">{family.name}</p><p className="text-xs text-landing-on-surface-variant">{family.location}</p></th>
                <td className="px-4 py-3.5 font-medium">{family.members}</td>
                <td className="px-4 py-3.5"><span className="rounded-[4px] bg-landing-surface-container px-2 py-0.5 text-xs font-medium">{family.ceremonies}</span></td>
                <td className="px-4 py-3.5 text-xs">{family.invitation}</td>
                <td className="px-4 py-3.5"><span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${family.pending ? "bg-landing-secondary-container text-landing-on-secondary-container" : "bg-landing-tertiary-fixed text-landing-on-tertiary-fixed"}`}>{family.status}</span></td>
              </tr>)}</tbody>
            </table>
          </div>
        </div>
        <div className="space-y-4 rounded-3xl bg-landing-surface p-6 shadow-xs lg:col-span-4">
          <div className="flex items-center justify-between pb-2"><span className="font-landing-label-md text-landing-label-md">Private Invitation Preview</span><span className="size-3 rounded-full bg-landing-secondary" /></div>
          <div className="space-y-4 rounded-2xl bg-landing-surface-container-low p-5">
            <div className="flex items-center gap-2"><span aria-hidden="true" className="material-symbols-outlined text-[20px] text-landing-primary">chat</span><p className="font-landing-label-sm text-landing-label-sm">Share your private link on WhatsApp</p></div>
            <p className="font-landing-body-sm text-landing-body-sm leading-relaxed text-landing-on-surface-variant">&ldquo;Namaste Uncle &amp; Aunty! Meera &amp; Aarav warmly request your presence at their wedding celebrations in Jaipur.&rdquo;</p>
            <div className="space-y-2 rounded-xl bg-landing-surface p-3 text-xs"><div className="flex justify-between gap-2"><span className="text-landing-on-surface-variant">Singhania Family:</span><span className="font-semibold">4 members</span></div><div className="flex justify-between gap-2"><span className="text-landing-on-surface-variant">Invited to:</span><span className="font-semibold text-landing-secondary">Sangeet &amp; Pheras</span></div></div>
            <div className="grid grid-cols-2 gap-2 pt-1"><PreviewAction kind="rsvp" className="rounded-[8px] bg-landing-primary-container py-2 text-xs font-semibold text-white">Try RSVP</PreviewAction><PreviewAction kind="rsvp" className="rounded-[8px] bg-landing-surface-container-high py-2 text-xs font-semibold text-landing-on-surface-variant">Update Count</PreviewAction></div>
          </div>
        </div>
      </div>
    </div>
  </section>;
}
