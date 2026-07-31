/**
 * Nhãn tiếng Việt + màu cho từng category.
 * Giá trị `value` phải khớp đúng enum của backend
 * (backend/src/constants/expenseCategories.js).
 */
export const CATEGORIES = [
  { value: 'food', label: 'Ăn uống', badge: 'bg-orange-100 text-orange-800', bar: 'bg-orange-500' },
  { value: 'transport', label: 'Di chuyển', badge: 'bg-sky-100 text-sky-800', bar: 'bg-sky-500' },
  { value: 'bills', label: 'Hoá đơn', badge: 'bg-amber-100 text-amber-800', bar: 'bg-amber-500' },
  { value: 'shopping', label: 'Mua sắm', badge: 'bg-pink-100 text-pink-800', bar: 'bg-pink-500' },
  { value: 'health', label: 'Sức khoẻ', badge: 'bg-emerald-100 text-emerald-800', bar: 'bg-emerald-500' },
  { value: 'education', label: 'Học tập', badge: 'bg-violet-100 text-violet-800', bar: 'bg-violet-500' },
  { value: 'entertainment', label: 'Giải trí', badge: 'bg-fuchsia-100 text-fuchsia-800', bar: 'bg-fuchsia-500' },
  { value: 'other', label: 'Khác', badge: 'bg-slate-100 text-slate-700', bar: 'bg-slate-400' },
];

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Tiền mặt' },
  { value: 'card', label: 'Thẻ' },
  { value: 'transfer', label: 'Chuyển khoản' },
  { value: 'ewallet', label: 'Ví điện tử' },
];

export const SORT_OPTIONS = [
  { value: '-date', label: 'Mới nhất' },
  { value: 'date', label: 'Cũ nhất' },
  { value: '-amount', label: 'Tiền nhiều nhất' },
  { value: 'amount', label: 'Tiền ít nhất' },
];

const FALLBACK_CATEGORY = {
  value: 'other',
  label: 'Khác',
  badge: 'bg-slate-100 text-slate-700',
  bar: 'bg-slate-400',
};

/** Tra cứu category an toàn: dữ liệu lạ vẫn hiển thị được thay vì làm vỡ UI. */
export function getCategory(value) {
  return CATEGORIES.find((category) => category.value === value) ?? FALLBACK_CATEGORY;
}

export function getPaymentMethodLabel(value) {
  return PAYMENT_METHODS.find((method) => method.value === value)?.label ?? value;
}
