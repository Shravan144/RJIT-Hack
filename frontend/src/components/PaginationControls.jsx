export default function PaginationControls({ page, totalPages, count, hasPrevious, hasNext, onPrevious, onNext, itemLabel = 'items' }) {
  return (
    <div className="flex items-center justify-between pt-2">
      <div className="text-xs text-brand-muted">
        Page {page} of {Math.max(1, totalPages)} • {count} {itemLabel}
      </div>
      <div className="flex gap-2">
        <button
          onClick={onPrevious}
          disabled={!hasPrevious}
          className="px-3 py-1.5 rounded-lg border border-brand-border text-sm text-brand-muted disabled:opacity-40"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={!hasNext}
          className="px-3 py-1.5 rounded-lg border border-brand-border text-sm text-brand-muted disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
