/**
 * Đề bài yêu cầu "ít nhất 1 trường phân loại/lọc".
 * `category` là trường đó — giữ ở một chỗ duy nhất để Mongoose schema,
 * Zod validation và tài liệu API không bao giờ lệch nhau.
 */
export const EXPENSE_CATEGORIES = [
  'food',
  'transport',
  'bills',
  'shopping',
  'health',
  'education',
  'entertainment',
  'other',
];

export const PAYMENT_METHODS = ['cash', 'card', 'transfer', 'ewallet'];

export const DEFAULT_CATEGORY = 'other';
export const DEFAULT_PAYMENT_METHOD = 'cash';
