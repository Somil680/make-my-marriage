"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useId, useRef, useState, type ReactNode } from "react";
import { demoMembers } from "./landing-data";

type PreviewKind = "workspace" | "rsvp" | "privacy-policy" | "terms-of-service" | "contact";
const information = {
  workspace: { title: "Your family. Your wedding workspace.", body: "Bring events, guest families, tasks, vendors, and expenses together. These examples show how your wedding could look." },
  rsvp: { title: "You're invited to the Sangeet", body: "Try a sample RSVP for the Singhania family. This demonstration does not send a real response." },
  "privacy-policy": { title: "Privacy Policy", body: "Our privacy policy will be published before registration opens. This landing-page demo does not submit or save your RSVP choices." },
  "terms-of-service": { title: "Terms of Service", body: "Our terms of service will be published before registration opens. The wedding details shown here are illustrative examples." },
  contact: { title: "Let's stay in touch", body: "Make My Marriage is taking shape. Contact details will be published when we launch. Until then, explore the wedding workspace preview." },
} as const;

export function PreviewAction({ kind, children, className }: { kind: PreviewKind; children: ReactNode; className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const headingId = useId();
  const [attending, setAttending] = useState<string[]>([...demoMembers]);
  const [saved, setSaved] = useState(false);
  const content = information[kind];

  return <>
    <button ref={trigger} type="button" className={className} onClick={() => { setSaved(false); dialog.current?.showModal(); }}>{children}</button>
    <dialog ref={dialog} aria-labelledby={headingId} onClose={() => trigger.current?.focus()} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }} className="landing-dialog m-auto max-w-lg rounded-3xl bg-landing-surface p-0 text-landing-on-surface shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm">
      <div className="relative p-7 sm:p-9">
        <button type="button" aria-label="Close preview" onClick={() => dialog.current?.close()} className="absolute right-4 top-4 rounded-full p-2 hover:bg-landing-surface-container"><X size={20} /></button>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-landing-secondary">Make My Marriage</p>
        <h2 id={headingId} className="pr-4 font-landing-headline-lg text-3xl">{content.title}</h2>
        <p className="mt-4 text-sm leading-6 text-landing-on-surface-variant">{content.body}</p>
        {kind === "rsvp" ? <form className="mt-5" onSubmit={(event) => { event.preventDefault(); setSaved(true); }}>
          <fieldset>
            <legend className="mb-3 text-sm font-semibold">Who will be attending?</legend>
            {demoMembers.map((name) => <label key={name} className="mb-2 flex items-center justify-between rounded-xl bg-landing-surface-container-low p-3 text-sm">{name}<input type="checkbox" className="size-5 accent-[#581c26]" checked={attending.includes(name)} onChange={(event) => { setSaved(false); setAttending((previous) => event.target.checked ? [...previous, name] : previous.filter((member) => member !== name)); }} /></label>)}
          </fieldset>
          <button type="submit" className="mt-3 rounded-full bg-landing-primary-container px-6 py-3 text-sm font-semibold text-white">Preview response</button>
          <p role="status" className="mt-3 min-h-10 text-sm text-landing-on-surface-variant">{saved ? `Demo response: ${attending.length} attending, ${demoMembers.length - attending.length} declining. No real RSVP was sent.` : `${attending.length} of ${demoMembers.length} family members selected.`}</p>
        </form> : <Link href={kind === "workspace" ? "/signup" : "#features"} onClick={() => dialog.current?.close()} className="mt-6 inline-flex rounded-full bg-landing-primary-container px-6 py-3 text-sm font-semibold text-white">{kind === "workspace" ? "Plan Your Wedding" : "Explore Features"}</Link>}
      </div>
    </dialog>
  </>;
}
