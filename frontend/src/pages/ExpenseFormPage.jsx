import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { CATEGORIES, PAYMENT_METHODS } from '../features/expenses/expense.constants.js';
import {
  toExpensePayload,
  validateExpenseForm,
} from '../features/expenses/expense.validation.js';
import * as expenseApi from '../features/expenses/expense.api.js';
import { Alert, Spinner } from '../shared/ui/Feedback.jsx';
import { Button } from '../shared/ui/Button.jsx';
import { SelectField, TextAreaField, TextField } from '../shared/ui/Field.jsx';
import { toDateInputValue } from '../shared/utils/formatters.js';

const CATEGORY_OPTIONS = CATEGORIES.map(({ value, label }) => ({ value, label }));

const EMPTY_VALUES = {
  title: '',
  amount: '',
  category: 'food',
  paymentMethod: 'cash',
  date: toDateInputValue(new Date()),
  note: '',
};

/**
 * Một trang dùng cho cả Tạo mới và Sửa.
 * Có `:id` trên URL thì là chế độ sửa — tránh nhân đôi một form phức tạp.
 */
export function ExpenseFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [values, setValues] = useState(EMPTY_VALUES);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Chế độ sửa: nạp dữ liệu hiện có vào form.
  useEffect(() => {
    if (!isEditMode) return undefined;

    let isActive = true;
    setIsLoading(true);

    expenseApi
      .fetchExpenseById(id)
      .then((expense) => {
        if (!isActive) return;
        setValues({
          title: expense.title,
          amount: String(expense.amount),
          category: expense.category,
          paymentMethod: expense.paymentMethod,
          date: toDateInputValue(expense.date),
          note: expense.note ?? '',
        });
      })
      .catch((requestError) => {
        if (isActive) setError(requestError);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [id, isEditMode]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    setFieldErrors((previous) => ({ ...previous, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    const errors = validateExpenseForm(values);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    const payload = toExpensePayload(values);

    try {
      if (isEditMode) {
        await expenseApi.updateExpense(id, payload);
        navigate(`/expenses/${id}`, { replace: true });
      } else {
        const created = await expenseApi.createExpense(payload);
        navigate(`/expenses/${created.id}`, { replace: true });
      }
    } catch (submitError) {
      setError(submitError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  // Không nạp được bản ghi cần sửa (404 / không phải của mình) -> không hiện form.
  if (isEditMode && error && values.title === '') {
    return (
      <div className="space-y-4">
        <Alert title="Không mở được khoản chi">{error.message}</Alert>
        <Link to="/" className="text-sm font-medium text-brand-700 hover:underline">
          ← Về danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        to={isEditMode ? `/expenses/${id}` : '/'}
        className="inline-block text-sm font-medium text-brand-700 hover:underline"
      >
        ← {isEditMode ? 'Về chi tiết' : 'Về danh sách'}
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h1 className="text-lg font-bold text-slate-900">
            {isEditMode ? 'Sửa khoản chi' : 'Thêm khoản chi'}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Các trường có dấu <span className="text-red-600">*</span> là bắt buộc
          </p>
        </div>

        {/* noValidate để dùng thông báo lỗi tiếng Việt của mình,
            thay cho tooltip mặc định của browser. */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4 p-5">
          {error && <Alert details={error.details}>{error.message}</Alert>}

          <TextField
            id="title"
            name="title"
            label="Tên khoản chi *"
            value={values.title}
            onChange={handleChange}
            error={fieldErrors.title}
            placeholder="Ăn trưa, tiền điện, vé xe…"
            maxLength={120}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="amount"
              name="amount"
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              label="Số tiền (VND) *"
              value={values.amount}
              onChange={handleChange}
              error={fieldErrors.amount}
              placeholder="65000"
            />

            <TextField
              id="date"
              name="date"
              type="date"
              label="Ngày chi *"
              value={values.date}
              onChange={handleChange}
              error={fieldErrors.date}
              // Không cho chọn ngày tương lai ngay trên widget của browser.
              max={toDateInputValue(new Date())}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              id="category"
              name="category"
              label="Phân loại *"
              value={values.category}
              onChange={handleChange}
              error={fieldErrors.category}
              options={CATEGORY_OPTIONS}
            />

            <SelectField
              id="paymentMethod"
              name="paymentMethod"
              label="Hình thức thanh toán"
              value={values.paymentMethod}
              onChange={handleChange}
              error={fieldErrors.paymentMethod}
              options={PAYMENT_METHODS}
            />
          </div>

          <TextAreaField
            id="note"
            name="note"
            label="Ghi chú"
            rows={3}
            value={values.note}
            onChange={handleChange}
            error={fieldErrors.note}
            hint={`${values.note.length}/200 ký tự`}
            maxLength={200}
            placeholder="Thông tin thêm (không bắt buộc)"
          />

          <div className="flex flex-wrap gap-2 pt-1">
            <Button type="submit" isLoading={isSubmitting}>
              {isEditMode ? 'Lưu thay đổi' : 'Thêm khoản chi'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate(isEditMode ? `/expenses/${id}` : '/')}
              disabled={isSubmitting}
            >
              Huỷ
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
