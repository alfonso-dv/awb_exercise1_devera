import { describeLoadError } from "../api/errors.ts";

interface ErrorStateProps {
  /** What failed to load, e.g. "the case file". */
  what: string;
  error: unknown;
  /** Shows a "Try again" button when given. */
  onRetry?: () => void;
}

/** Red, clearly-an-error panel with a human-readable reason and a retry. */
export function ErrorState({ what, error, onRetry }: ErrorStateProps) {
  return (
    <div className="error-state" role="alert">
      <h3>Couldn&apos;t load {what}</h3>
      <p>{describeLoadError(error)}</p>
      {onRetry && (
        <button
          type="button"
          className="btn btn-primary btn-small"
          onClick={onRetry}
        >
          Try again
        </button>
      )}
    </div>
  );
}
