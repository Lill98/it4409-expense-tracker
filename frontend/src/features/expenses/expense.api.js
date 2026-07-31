import { httpClient } from '../../shared/api/httpClient.js';

const RESOURCE = '/api/expenses';

/**
 * Tầng gọi API cho expenses.
 *
 * Bỏ các tham số rỗng trước khi gửi: backend dùng Zod `.strict()` nên
 * `?category=` (giá trị rỗng) sẽ bị từ chối 400.
 */
function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value != null),
  );
}

/**
 * `signal` truyền riêng vào config của axios, không trộn vào query string —
 * nếu nhét vào `params` thì nó sẽ bị serialize lên URL và backend trả 400.
 */
export async function fetchExpenses(params, { signal } = {}) {
  const { data } = await httpClient.get(RESOURCE, { params: cleanParams(params), signal });
  return { items: data.data, meta: data.meta };
}

export async function fetchExpenseById(id) {
  const { data } = await httpClient.get(`${RESOURCE}/${id}`);
  return data.data;
}

export async function createExpense(payload) {
  const { data } = await httpClient.post(RESOURCE, payload);
  return data.data;
}

export async function updateExpense(id, payload) {
  const { data } = await httpClient.put(`${RESOURCE}/${id}`, payload);
  return data.data;
}

export async function deleteExpense(id) {
  await httpClient.delete(`${RESOURCE}/${id}`);
}

export async function fetchMonthlySummary(month) {
  const { data } = await httpClient.get(`${RESOURCE}/summary`, {
    params: cleanParams({ month }),
  });
  return data.data;
}
