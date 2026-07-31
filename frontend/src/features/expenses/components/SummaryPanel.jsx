import { formatCurrency } from '../../../shared/utils/formatters.js';
import { getCategory } from '../expense.constants.js';

/**
 * Thống kê chi tiêu tháng theo category.
 * Dữ liệu do MongoDB aggregation pipeline tính ở backend
 * (GET /api/expenses/summary) — frontend chỉ vẽ lại.
 */
export function SummaryPanel({ summary, month, onMonthChange }) {
  const hasData = summary && summary.transactionCount > 0;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Thống kê tháng</h2>
          <p className="mt-0.5 text-sm text-slate-500">Tổng chi theo phân loại</p>
        </div>
        <div>
          <label htmlFor="summary-month" className="sr-only">
            Chọn tháng
          </label>
          <input
            id="summary-month"
            type="month"
            value={month}
            onChange={(event) => onMonthChange(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-brand-50 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-700">Tổng chi</p>
        <p className="mt-1 text-2xl font-bold text-brand-700">
          {formatCurrency(summary?.total)}
        </p>
        <p className="mt-0.5 text-xs text-brand-600">
          {summary?.transactionCount ?? 0} giao dịch
        </p>
      </div>

      {hasData ? (
        <ul className="mt-4 space-y-3">
          {summary.byCategory.map((row) => {
            const { label, bar } = getCategory(row.category);
            return (
              <li key={row.category}>
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="font-medium text-slate-700">{label}</span>
                  <span className="tabular-nums text-slate-600">
                    {formatCurrency(row.total)}
                    <span className="ml-1.5 text-xs text-slate-400">{row.percentage}%</span>
                  </span>
                </div>
                {/* Thanh tiến trình: role="img" + aria-label để screen reader
                    đọc được con số, vì thanh màu tự nó không mang thông tin. */}
                <div
                  role="img"
                  aria-label={`${label}: ${row.percentage}% tổng chi`}
                  className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100"
                >
                  <div
                    className={`h-full rounded-full ${bar}`}
                    style={{ width: `${Math.max(row.percentage, 2)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-500">Chưa có khoản chi nào trong tháng này.</p>
      )}
    </section>
  );
}
