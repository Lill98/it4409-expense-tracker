import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { CategoryBadge } from '../features/expenses/components/CategoryBadge.jsx';
import { getPaymentMethodLabel } from '../features/expenses/expense.constants.js';
import * as expenseApi from '../features/expenses/expense.api.js';
import { Alert, Spinner } from '../shared/ui/Feedback.jsx';
import { Button } from '../shared/ui/Button.jsx';
import { ConfirmDialog } from '../shared/ui/ConfirmDialog.jsx';
import { formatCurrency, formatDate, formatLongDate } from '../shared/utils/formatters.js';

function DetailRow({ label, children }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 py-3 last:border-0">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-sm font-medium text-slate-900">{children}</dd>
    </div>
  );
}

export function ExpenseDetailPage() {
  // useParams đọc :id từ URL (Lec 6 - URL Parameters).
  const { id } = useParams();
  const navigate = useNavigate();

  const [expense, setExpense] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setError(null);

    expenseApi
      .fetchExpenseById(id)
      .then((data) => {
        if (isActive) setExpense(data);
      })
      .catch((requestError) => {
        if (isActive) setError(requestError.message);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await expenseApi.deleteExpense(id);
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
      setIsConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  // Backend trả 404 cho cả "không tồn tại" và "không phải của bạn" —
  // đó là chủ ý, để không ai dò được id nào đang tồn tại.
  if (error) {
    return (
      <div className="space-y-4">
        <Alert title="Không mở được khoản chi">{error}</Alert>
        <Link to="/" className="text-sm font-medium text-brand-700 hover:underline">
          ← Về danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link to="/" className="inline-block text-sm font-medium text-brand-700 hover:underline">
        ← Về danh sách
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{expense.title}</h1>
              <p className="mt-1 text-sm text-slate-500">{formatLongDate(expense.date)}</p>
            </div>
            <CategoryBadge category={expense.category} />
          </div>
          <p className="mt-4 text-3xl font-bold text-brand-700">
            {formatCurrency(expense.amount)}
          </p>
        </div>

        {/* Phân loại đã hiện bằng badge ở header nên không lặp lại ở đây. */}
        <dl className="px-5 py-2">
          <DetailRow label="Hình thức thanh toán">
            {getPaymentMethodLabel(expense.paymentMethod)}
          </DetailRow>
          <DetailRow label="Ngày chi">{formatDate(expense.date)}</DetailRow>
          <DetailRow label="Ghi chú">
            {expense.note ? (
              expense.note
            ) : (
              <span className="font-normal text-slate-400">Không có</span>
            )}
          </DetailRow>
          <DetailRow label="Tạo lúc">{formatDate(expense.createdAt)}</DetailRow>
          {expense.updatedAt !== expense.createdAt && (
            <DetailRow label="Sửa lần cuối">{formatDate(expense.updatedAt)}</DetailRow>
          )}
        </dl>

        <div className="flex flex-wrap gap-2 border-t border-slate-200 p-5">
          <Link
            to={`/expenses/${expense.id}/edit`}
            className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Sửa
          </Link>
          <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
            Xoá
          </Button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Xoá khoản chi này?"
        description={`"${expense.title}" sẽ bị xoá vĩnh viễn và không thể hoàn tác.`}
        confirmLabel="Xoá"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
