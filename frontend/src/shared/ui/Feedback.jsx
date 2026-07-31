const ALERT_VARIANTS = {
  error: 'border-red-200 bg-red-50 text-red-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  info: 'border-brand-100 bg-brand-50 text-brand-700',
};

/**
 * Hiển thị lỗi. Nếu backend trả `details` (mảng lỗi validate từng field),
 * liệt kê ra để người dùng biết chính xác trường nào sai.
 */
export function Alert({ variant = 'error', title, details, children }) {
  return (
    <div role="alert" className={`rounded-lg border p-3 text-sm ${ALERT_VARIANTS[variant]}`}>
      {title && <p className="font-semibold">{title}</p>}
      {children}
      {details?.length > 0 && (
        <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-xs">
          {details.map((detail) => (
            <li key={`${detail.field}-${detail.message}`}>
              <span className="font-medium">{detail.field}</span>: {detail.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Spinner({ label = 'Đang tải…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-sm text-slate-500">
      <span
        aria-hidden="true"
        className="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600"
      />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <p className="text-base font-semibold text-slate-800">{title}</p>
      {description && <p className="max-w-sm text-sm text-slate-500">{description}</p>}
      {action}
    </div>
  );
}
