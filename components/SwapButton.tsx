'use client';

import { useState } from 'react';

interface SwapButtonProps {
  onClick: () => void;
}

/**
 * Swap control that sits between the two currency plates. The arrows rotate a
 * half-turn on each press — a small mechanical cue that the pair flipped.
 */
export default function SwapButton({ onClick }: SwapButtonProps) {
  const [turns, setTurns] = useState(0);

  const handleClick = () => {
    setTurns((t) => t + 1);
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className="flex w-full items-center justify-center rounded-md border border-brass/40 bg-ink px-4 py-3 text-paper shadow-sm transition-colors hover:bg-[#13332f] focus:outline-none focus:ring-2 focus:ring-brass/40 sm:w-auto"
      title="Swap currencies"
      aria-label="Swap currencies"
    >
      <svg
        className="h-5 w-5 transition-transform duration-300 ease-out"
        style={{ transform: `rotate(${turns * 180}deg)` }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      </svg>
    </button>
  );
}
