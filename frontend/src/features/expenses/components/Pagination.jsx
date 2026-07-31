import { Button } from '../../../shared/ui/Button.jsx';

export function Pagination({ meta, onPageChange }) {
  if (!meta || meta.totalPages <= 1) {
    return null;
  }

  const { page, totalPages, total } = meta;

  return (
    <nav
      aria-label="Phân trang"
      className="flex flex-wrap items-center justify-between gap-3 text-sm"
    >
      <p className="text-slate-500">
        Trang <span className="font-medium text-slate-700">{page}</span> / {totalPages} — tổng{' '}
        <span className="font-medium text-slate-700">{total}</span> khoản chi
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 text-xs"
        >
          Trước
        </Button>
        <Button
          variant="secondary"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 text-xs"
        >
          Sau
        </Button>
      </div>
    </nav>
  );
}
