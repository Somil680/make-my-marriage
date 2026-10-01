

export function TraditionsSection() {
  return (
    <section className="w-full bg-landing-surface-container-low py-landing-space-xl" id="traditions">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="font-landing-eyebrow text-landing-eyebrow text-landing-secondary uppercase tracking-widest">
            {"Purpose-Built Architecture"}
          </span>
          <h2 className="font-landing-headline-lg text-3xl sm:text-landing-headline-lg text-landing-on-surface mt-2">
            {"Engineered specifically for Indian traditions."}
          </h2>
          <p className="font-landing-body-md text-landing-body-md text-landing-on-surface-variant mt-3">
            {" Thoughtfully organized around the family relationships, meaningful rituals, and many celebrations that make an Indian wedding yours. "}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-landing-surface shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-[12px] bg-landing-secondary-container/50 text-landing-on-secondary-container flex items-center justify-center">
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                {"calendar_view_week"}
              </span>
            </div>
            <h3 className="font-landing-headline-sm text-landing-headline-sm text-landing-on-surface">
              {"Multi-Day Ceremonies"}
            </h3>
            <p className="font-landing-body-sm text-landing-body-sm text-landing-on-surface-variant">
              {" Separate timelines, guest invitations, and vendor assignments for Mehendi, Sangeet, Tilak, Baraat, Pheras, and Reception. "}
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-landing-surface shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-[12px] bg-landing-primary-fixed text-landing-primary flex items-center justify-center">
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                {"diversity_1"}
              </span>
            </div>
            <h3 className="font-landing-headline-sm text-landing-headline-sm text-landing-on-surface">
              {"Household Family Grouping"}
            </h3>
            <p className="font-landing-body-sm text-landing-body-sm text-landing-on-surface-variant">
              {" Address invitations respectfully to \"Shri & Shrimati\" with automatic count tracking for children, teens, and elders. "}
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-landing-surface shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-[12px] bg-landing-tertiary-fixed text-landing-on-tertiary-fixed flex items-center justify-center">
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                {"call"}
              </span>
            </div>
            <h3 className="font-landing-headline-sm text-landing-headline-sm text-landing-on-surface">
              {"WhatsApp-Friendly Invites"}
            </h3>
            <p className="font-landing-body-sm text-landing-body-sm text-landing-on-surface-variant">
              {" Prepare a personal message and share a private invitation link on WhatsApp. Families respond on your wedding website. "}
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-landing-surface shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-[12px] bg-landing-surface-container-highest text-landing-on-surface flex items-center justify-center">
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                {"currency_rupee"}
              </span>
            </div>
            <h3 className="font-landing-headline-sm text-landing-headline-sm text-landing-on-surface">
              {"Lakhs & Crores Ledger"}
            </h3>
            <p className="font-landing-body-sm text-landing-body-sm text-landing-on-surface-variant">
              {" Track actual spending in INR, see who paid, and review expenses by event, category, and vendor. "}
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-landing-surface shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-[12px] bg-landing-secondary-container/50 text-landing-on-secondary-container flex items-center justify-center">
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                {"calendar_view_week"}
              </span>
            </div>
            <h3 className="font-landing-headline-sm text-landing-headline-sm text-landing-on-surface">
              {"Wedding-Day Run Sheet"}
            </h3>
            <p className="font-landing-body-sm text-landing-body-sm text-landing-on-surface-variant">
              {" Keep ceremony times, locations, and organizer responsibilities together in a clear, chronological event timeline. "}
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-landing-surface shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-[12px] bg-landing-primary-fixed text-landing-primary flex items-center justify-center">
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                {"lock_person"}
              </span>
            </div>
            <h3 className="font-landing-headline-sm text-landing-headline-sm text-landing-on-surface">
              {"Private Finances"}
            </h3>
            <p className="font-landing-body-sm text-landing-body-sm text-landing-on-surface-variant">
              {" Share event checklists with wider cousins while keeping payments, jewellery budgets, and contracts strictly private. "}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
