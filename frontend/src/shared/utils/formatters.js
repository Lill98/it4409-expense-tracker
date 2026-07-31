const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const longDateFormatter = new Intl.DateTimeFormat('vi-VN', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

export function formatCurrency(amount) {
  return currencyFormatter.format(amount ?? 0);
}

export function formatDate(value) {
  if (!value) return '';
  return dateFormatter.format(new Date(value));
}

export function formatLongDate(value) {
  if (!value) return '';
  return longDateFormatter.format(new Date(value));
}

/** Chuyển ISO date sang "YYYY-MM-DD" cho <input type="date">. */
export function toDateInputValue(value) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

/** Tháng hiện tại dạng "YYYY-MM" cho <input type="month">. */
export function currentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
