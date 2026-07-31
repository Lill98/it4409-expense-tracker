import { ApiError } from '../../shared/ApiError.js';
import * as expenseRepository from './expense.repository.js';

/**
 * Nghiệp vụ của expenses. Mọi hàm đều nhận `userId` lấy từ JWT (do
 * middleware authenticate gắn vào req.user) và truyền xuống repository.
 */

/**
 * Khi không tìm thấy, luôn trả 404 chứ không phải 403.
 *
 * Lý do: 403 gián tiếp xác nhận "id này có tồn tại, chỉ là không phải của bạn",
 * cho phép kẻ tấn công dò xem những id nào đang tồn tại trong hệ thống.
 * 404 khiến "không tồn tại" và "không phải của bạn" trở nên không phân biệt được.
 */
const NOT_FOUND_MESSAGE = 'Expense not found';

export async function listExpenses(userId, query) {
  const { items, total } = await expenseRepository.findManyByUser(userId, query);
  const totalPages = Math.ceil(total / query.limit) || 1;

  return {
    items: items.map((item) => item.toJSON()),
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages,
      hasNextPage: query.page < totalPages,
    },
  };
}

export async function getExpenseById(id, userId) {
  const expense = await expenseRepository.findOneByUser(id, userId);
  if (!expense) {
    throw ApiError.notFound(NOT_FOUND_MESSAGE);
  }
  return expense.toJSON();
}

export async function createExpense(userId, payload) {
  const expense = await expenseRepository.createForUser(userId, payload);
  return expense.toJSON();
}

export async function replaceExpense(id, userId, payload) {
  const expense = await expenseRepository.replaceOneByUser(id, userId, payload);
  if (!expense) {
    throw ApiError.notFound(NOT_FOUND_MESSAGE);
  }
  return expense.toJSON();
}

export async function deleteExpense(id, userId) {
  const expense = await expenseRepository.deleteOneByUser(id, userId);
  if (!expense) {
    throw ApiError.notFound(NOT_FOUND_MESSAGE);
  }
}

/** Đầu và cuối tháng theo UTC, từ chuỗi "YYYY-MM". */
function resolveMonthRange(month) {
  const now = new Date();
  const [year, monthIndex] = month
    ? month.split('-').map(Number)
    : [now.getUTCFullYear(), now.getUTCMonth() + 1];

  const from = new Date(Date.UTC(year, monthIndex - 1, 1, 0, 0, 0, 0));
  // Ngày 0 của tháng sau = ngày cuối của tháng này, tự xử lý được năm nhuận.
  const to = new Date(Date.UTC(year, monthIndex, 0, 23, 59, 59, 999));

  return { from, to, month: `${year}-${String(monthIndex).padStart(2, '0')}` };
}

/**
 * Thống kê chi tiêu theo category cho một tháng.
 * Mặc định là tháng hiện tại nếu client không truyền `month`.
 */
export async function getMonthlySummary(userId, { month } = {}) {
  const range = resolveMonthRange(month);
  const byCategory = await expenseRepository.aggregateByCategory(userId, range);

  const total = byCategory.reduce((sum, row) => sum + row.total, 0);
  const transactionCount = byCategory.reduce((sum, row) => sum + row.count, 0);

  return {
    month: range.month,
    total,
    transactionCount,
    byCategory: byCategory.map((row) => ({
      ...row,
      // Tỷ lệ % để frontend vẽ thanh tiến trình mà không phải tự tính lại.
      percentage: total === 0 ? 0 : Math.round((row.total / total) * 100),
    })),
  };
}
