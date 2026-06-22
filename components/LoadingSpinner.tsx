interface LoadingSpinnerProps {
  message?: string;
}

/**
 * Loading state shown on the ticket while live rates are fetched.
 */
export default function LoadingSpinner({
  message = 'Loading...',
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-muted" role="status">
      <span className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-brass" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
