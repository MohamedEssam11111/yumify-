const Pagination = ({ page, pageSize, total, onPageChange }) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        className="px-3 py-1 rounded border text-sm disabled:opacity-50"
        onClick={() => canPrev && onPageChange(page - 1)}
        disabled={!canPrev}
        aria-label="Previous page"
      >
        Prev
      </button>
      {pages.map((p, idx) => (
        typeof p === "number" ? (
          <button
            key={idx}
            className={`px-3 py-1 rounded border text-sm ${p === page ? "bg-gray-800 text-white" : "bg-white"}`}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        ) : (
          <span key={idx} className="px-2 text-gray-500">{p}</span>
        )
      ))}
      <button
        className="px-3 py-1 rounded border text-sm disabled:opacity-50"
        onClick={() => canNext && onPageChange(page + 1)}
        disabled={!canNext}
        aria-label="Next page"
      >
        Next
      </button>
    </nav>
  );
};

export default Pagination;
