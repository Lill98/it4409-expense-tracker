import { useCallback, useEffect, useState } from 'react';

import * as expenseApi from '../expense.api.js';

/**
 * Lấy danh sách chi tiêu theo bộ lọc, kèm loading/error.
 *
 * Nhận `filters` đã được ổn định (memo hoá ở phía gọi) để useEffect không
 * chạy lại mỗi lần render.
 */
export function useExpenses(filters) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Tăng số này để buộc tải lại sau khi xoá một khoản chi.
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    // AbortController để bỏ kết quả của request cũ khi bộ lọc thay đổi nhanh:
    // không có nó, response về muộn của bộ lọc trước có thể ghi đè lên
    // response mới hơn (race condition) — Lec 7.
    const controller = new AbortController();

    setIsLoading(true);
    setError(null);

    expenseApi
      .fetchExpenses(filters, { signal: controller.signal })
      .then(({ items: data, meta: pagination }) => {
        setItems(data);
        setMeta(pagination);
        setIsLoading(false);
      })
      .catch((requestError) => {
        if (controller.signal.aborted) return;
        setError(requestError.message);
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [filters, reloadToken]);

  return { items, meta, isLoading, error, reload };
}

/** Lấy thống kê tháng. Tách riêng khỏi danh sách để hai phần tải song song. */
export function useMonthlySummary(month, reloadToken = 0) {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);

    expenseApi
      .fetchMonthlySummary(month)
      .then((data) => {
        if (isActive) setSummary(data);
      })
      .catch(() => {
        // Thống kê là thông tin phụ trợ: lỗi ở đây không nên chặn cả trang,
        // chỉ ẩn khối thống kê đi.
        if (isActive) setSummary(null);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [month, reloadToken]);

  return { summary, isLoading };
}
