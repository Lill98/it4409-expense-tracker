import { Link } from 'react-router-dom';

import { formatCurrency, formatDate } from '../../../shared/utils/formatters.js';
import { getPaymentMethodLabel } from '../expense.constants.js';
import { CategoryBadge } from './CategoryBadge.jsx';

/**
 * Danh sách chi tiêu, hiển thị hai dạng theo kích thước màn hình:
 *   - mobile  : danh sách card, mỗi khoản chi một khối dễ chạm
 *   - desktop : bảng, so sánh nhiều dòng nhanh hơn
 *
 * Cả hai render từ cùng một dữ liệu; Tailwind ẩn/hiện bằng breakpoint `md:`
 * nên không có logic JS nào phụ thuộc kích thước màn hình.
 */
export function ExpenseList({ items, onRequestDelete }) {
  return (
    <>
      {/* Mobile: card */}
      <ul className="space-y-3 md:hidden">
        {items.map((expense) => (
          <li key={expense.id}>
            <Link
              to={`/expenses/${expense.id}`}
              className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-brand-500"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{expense.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatDate(expense.date)}</p>
                </div>
                <p className="shrink-0 font-semibold text-slate-900">
                  {formatCurrency(expense.amount)}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <CategoryBadge category={expense.category} />
                <span className="text-xs text-slate-500">
                  {getPaymentMethodLabel(expense.paymentMethod)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* Desktop: bảng */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Tên khoản chi</th>
              <th scope="col" className="px-4 py-3 font-medium">Phân loại</th>
              <th scope="col" className="px-4 py-3 font-medium">Ngày</th>
              <th scope="col" className="px-4 py-3 font-medium">Thanh toán</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Số tiền</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                <span className="sr-only">Hành động</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((expense) => (
              <tr key={expense.id} className="transition-colors hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link
                    to={`/expenses/${expense.id}`}
                    className="font-medium text-slate-900 hover:text-brand-700 hover:underline"
                  >
                    {expense.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <CategoryBadge category={expense.category} />
                </td>
                <td className="px-4 py-3 text-slate-600">{formatDate(expense.date)}</td>
                <td className="px-4 py-3 text-slate-600">
                  {getPaymentMethodLabel(expense.paymentMethod)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-900">
                  {formatCurrency(expense.amount)}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Link
                    to={`/expenses/${expense.id}/edit`}
                    className="text-xs font-medium text-brand-700 hover:underline"
                  >
                    Sửa
                  </Link>
                  <button
                    type="button"
                    onClick={() => onRequestDelete(expense)}
                    className="ml-3 text-xs font-medium text-red-600 hover:underline"
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
