'use client';

interface RefreshButtonProps {
  onClick: () => void;
  refreshing?: boolean;
}

/**
 * Manual "refresh rates" control. Sits in the converter row next to the swap
 * button and shares its ink/brass styling. While a refresh is in flight the
 * icon spins and the button is disabled to prevent duplicate requests.
 */
export default function RefreshButton({
  onClick,
  refreshing = false,
}: RefreshButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={refreshing}
      title="Refresh rates"
      aria-label="Refresh rates"
      aria-busy={refreshing}
      className="flex w-full items-center justify-center rounded-md border border-brass/40 bg-ink px-4 py-3 text-paper shadow-sm transition-colors hover:bg-[#13332f] focus:outline-none focus:ring-2 focus:ring-brass/40 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      <svg
        className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    </button>
  );
}
