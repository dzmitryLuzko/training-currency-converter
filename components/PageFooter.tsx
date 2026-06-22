interface PageFooterProps {
  lastUpdated?: number;
}

/**
 * Footer note: refresh cadence and the timestamp of the loaded rate set.
 */
export default function PageFooter({ lastUpdated }: PageFooterProps) {
  return (
    <footer className="mt-8 flex flex-col gap-1 border-t border-paper/10 pt-5 text-xs text-paper/45 sm:flex-row sm:items-center sm:justify-between">
      <span>Mid-market rates · refreshed hourly</span>
      {lastUpdated && (
        <span className="tabular font-mono">
          Updated {new Date(lastUpdated).toLocaleString()}
        </span>
      )}
    </footer>
  );
}
