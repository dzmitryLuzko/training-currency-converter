interface PageHeaderProps {
  title: string;
  subtitle: string;
}

/**
 * Masthead above the ticket. The eyebrow frames the page as a live FX counter.
 */
export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="mb-6">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.28em] text-brass">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-brass" />
        Foreign Exchange · live
      </div>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-paper sm:text-5xl">
        {title}
      </h1>
      <p className="mt-2 max-w-md text-sm text-paper/60">{subtitle}</p>
    </header>
  );
}
