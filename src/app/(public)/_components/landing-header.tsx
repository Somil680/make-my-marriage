"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { navigation } from "./landing-data";

export function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [menuOpen]);

  return (
    <header className="landing-header fixed top-0 z-50 w-full bg-landing-surface/85 shadow-[0_1px_8px_rgba(28,26,23,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between gap-4 px-6 lg:px-12">
        <Link href="#home" aria-label="Make My Marriage home" onClick={() => setMenuOpen(false)} className="shrink-0">
          <Image src="/landing/wordmark.svg" alt="Make My Marriage" width={240} height={50} priority className="landing-logo h-12 w-auto" />
        </Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-1 xl:flex">
          {navigation.map((item) => <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-landing-on-surface-variant transition-colors hover:bg-landing-surface-container hover:text-landing-primary">{item.label}</Link>)}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden whitespace-nowrap rounded-full px-3 py-2.5 text-sm font-semibold text-landing-on-surface-variant hover:bg-landing-surface-container sm:inline-flex">Sign In</Link>
          <Link href="/signup" className="landing-header-cta inline-flex h-12 items-center justify-center whitespace-nowrap rounded-full bg-landing-primary-container px-7 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(88,28,38,0.2)] transition-colors hover:bg-landing-primary">Plan Your Wedding</Link>
          <Link href="/login" aria-label="Sign in to your wedding workspace" className="hidden size-10 shrink-0 items-center justify-center rounded-full bg-landing-primary text-white xl:flex"><UserRound size={20} /></Link>
          <button ref={menuButton} type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)} className="flex size-10 shrink-0 items-center justify-center rounded-full text-landing-primary hover:bg-landing-surface-container xl:hidden">{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </div>
      <nav id="mobile-navigation" aria-label="Mobile navigation" hidden={!menuOpen} className="border-t border-landing-outline-variant/30 bg-landing-surface px-6 py-5 xl:hidden">
        {navigation.map((item) => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="block rounded-xl px-4 py-3 text-landing-on-surface hover:bg-landing-surface-container">{item.label}</Link>)}
        <Link href="/login" className="block rounded-xl px-4 py-3 font-semibold text-landing-primary" onClick={() => setMenuOpen(false)}>Sign In</Link>
      </nav>
    </header>
  );
}
