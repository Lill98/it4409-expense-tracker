import { Button } from '../../../shared/ui/Button.jsx';
import { CATEGORIES, SORT_OPTIONS } from '../expense.constants.js';

const CONTROL_CLASSES =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 ' +
  'focus:border-brand-600 focus:outline-none';

/**
 * Thanh lọc: theo category (trường phân loại của đề bài), khoảng ngày,
 * tìm theo tên và sắp xếp.
 *
 * Component không giữ state riêng — nhận `filters` và gọi `onChange`.
 * Nguồn sự thật duy nhất là URL query string ở DashboardPage, nhờ vậy
 * người dùng chia sẻ link hay F5 vẫn giữ đúng bộ lọc.
 */
export function FilterBar({ filters, onChange, onReset }) {
  const hasActiveFilter = Boolean(
    filters.category || filters.from || filters.to || filters.search,
  );

  const update = (key) => (event) => onChange({ [key]: event.target.value });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* 1 cột trên mobile, 2 cột trên tablet, 5 cột trên desktop. */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor="filter-search" className="mb-1.5 block text-xs font-medium text-slate-600">
            Tìm kiếm
          </label>
          <input
            id="filter-search"
            type="search"
            value={filters.search ?? ''}
            onChange={update('search')}
            placeholder="Tên khoản chi…"
            className={CONTROL_CLASSES}
          />
        </div>

        <div>
          <label htmlFor="filter-category" className="mb-1.5 block text-xs font-medium text-slate-600">
            Phân loại
          </label>
          <select
            id="filter-category"
            value={filters.category ?? ''}
            onChange={update('category')}
            className={CONTROL_CLASSES}
          >
            <option value="">Tất cả</option>
            {CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-from" className="mb-1.5 block text-xs font-medium text-slate-600">
            Từ ngày
          </label>
          <input
            id="filter-from"
            type="date"
            value={filters.from ?? ''}
            onChange={update('from')}
            max={filters.to || undefined}
            className={CONTROL_CLASSES}
          />
        </div>

        <div>
          <label htmlFor="filter-to" className="mb-1.5 block text-xs font-medium text-slate-600">
            Đến ngày
          </label>
          <input
            id="filter-to"
            type="date"
            value={filters.to ?? ''}
            onChange={update('to')}
            min={filters.from || undefined}
            className={CONTROL_CLASSES}
          />
        </div>

        <div>
          <label htmlFor="filter-sort" className="mb-1.5 block text-xs font-medium text-slate-600">
            Sắp xếp
          </label>
          <select
            id="filter-sort"
            value={filters.sort ?? '-date'}
            onChange={update('sort')}
            className={CONTROL_CLASSES}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasActiveFilter && (
        <div className="mt-3 flex justify-end">
          <Button variant="ghost" onClick={onReset} className="text-xs">
            Xoá bộ lọc
          </Button>
        </div>
      )}
    </div>
  );
}
