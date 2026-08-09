export function LoadingState({ label = "Retrieving articles…" }) {
  return <div className="state-banner state-loading">{label}</div>;
}

export function ErrorState({ message = "An error occurred. Please try again.", onRetry }) {
  return (
    <div className="state-banner state-error">
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-small" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message = "No results found." }) {
  return <div className="state-banner state-empty">{message}</div>;
}
