import { useCallback, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { ExpenseList } from '../features/expenses/components/ExpenseList.jsx';
import { FilterBar } from '../features/expenses/components/FilterBar.jsx';
import { Pagination } from '../features/expenses/components/Pagination.jsx';
import { SummaryPanel } from '../features/expenses/components/SummaryPanel.jsx';
import { useExpenses, useMonthlySummary } from '../features/expenses/hooks/useExpenses.js';
import * as expenseApi from '../features/expenses/expense.api.js';
import { Alert, EmptyState, Spinner } from '../shared/ui/Feedback.jsx';
import { Button } from '../shared/ui/Button.jsx';
import { ConfirmDialog } from '../shared/ui/ConfirmDialog.jsx';
import { currentMonthValue } from '../shared/utils/formatters.js';

const PAGE_SIZE = 10;

export function DashboardPage() {
  // URL query string là nguồn sự thật duy nhất cho bộ lọc: người dùng F5,
  // bấm Back hay chia sẻ link đều giữ nguyên trạng thái đang xem.
  const [searchParams, setSearchParams] = useSearchParams();
  const [month, setMonth] = useState(currentMonthValue);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const filters = useMemo(
    () => ({
      search: searchParams.get('search') ?? '',
      category: searchParams.get('category') ?? '',
      from: searchParams.get('from') ?? '',
      to: searchParams.get('to') ?? '',
      sort: searchParams.get('sort') ?? '-date',
      page: Number(searchParams.get('page') ?? 1),
      limit: PAGE_SIZE,
    }),
    [searchParams],
  );

  const { items, meta, isLoading, error, reload } = useExpenses(filters);
  // Dùng chung `reloadToken` với danh sách: xoá một khoản chi thì cả bảng
  // và thống kê phải cùng cập nhật.
  const [summaryToken, setSummaryToken] = useState(0);
  const { summary } = useMonthlySummary(month, summaryToken);

  const updateFilters = useCallback(
    (changes) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          Object.entries(changes).forEach(([key, value]) => {
            if (value === '' || value == null) {
              next.delete(key);
            } else {
              next.set(key, String(value));
            }
          });
          // Đổi bộ lọc thì phải về trang 1, nếu không sẽ rơi vào trang trống.
          if (!('page' in changes)) {
            next.delete('page');
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const resetFilters = useCallback(() => setSearchParams({}, { replace: true }), [setSearchParams]);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await expenseApi.deleteExpense(pendingDelete.id);
      setPendingDelete(null);
      reload();
      setSummaryToken((token) => token + 1);
    } catch (requestError) {
      setDeleteError(requestError.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const hasActiveFilter = Boolean(
    filters.search || filters.category || filters.from || filters.to,
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Chi tiêu của tôi</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Theo dõi, phân loại và thống kê chi tiêu cá nhân
          </p>
        </div>
        <Link
          to="/expenses/new"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          + Thêm khoản chi
        </Link>
      </div>

      {/* Thống kê xếp trên danh sách ở mobile, thành cột phải ở desktop. */}
      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4 lg:order-1">
          <FilterBar filters={filters} onChange={updateFilters} onReset={resetFilters} />

          {deleteError && <Alert>{deleteError}</Alert>}
          {error && <Alert title="Không tải được danh sách">{error}</Alert>}

          {isLoading && <Spinner />}

          {!isLoading && !error && items.length === 0 && (
            <EmptyState
              title={hasActiveFilter ? 'Không tìm thấy khoản chi nào' : 'Chưa có khoản chi nào'}
              description={
                hasActiveFilter
                  ? 'Thử bỏ bớt điều kiện lọc để xem thêm kết quả.'
                  : 'Thêm khoản chi đầu tiên để bắt đầu theo dõi.'
              }
              action={
                hasActiveFilter ? (
                  <Button variant="secondary" onClick={resetFilters}>
                    Xoá bộ lọc
                  </Button>
                ) : (
                  <Link
                    to="/expenses/new"
                    className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
                  >
                    + Thêm khoản chi
                  </Link>
                )
              }
            />
          )}

          {!isLoading && !error && items.length > 0 && (
            <>
              <ExpenseList items={items} onRequestDelete={setPendingDelete} />
              <Pagination meta={meta} onPageChange={(page) => updateFilters({ page })} />
            </>
          )}
        </div>

        <aside className="lg:order-2">
          <SummaryPanel summary={summary} month={month} onMonthChange={setMonth} />
        </aside>
      </div>

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        title="Xoá khoản chi này?"
        description={
          pendingDelete
            ? `"${pendingDelete.title}" sẽ bị xoá vĩnh viễn và không thể hoàn tác.`
            : ''
        }
        confirmLabel="Xoá"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setPendingDelete(null);
          setDeleteError(null);
        }}
      />
    </div>
  );
}
