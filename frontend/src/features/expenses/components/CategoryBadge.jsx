import { getCategory } from '../expense.constants.js';

export function CategoryBadge({ category }) {
  const { label, badge } = getCategory(category);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge}`}
    >
      {label}
    </span>
  );
}
