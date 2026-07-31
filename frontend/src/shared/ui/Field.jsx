const CONTROL_CLASSES =
  'w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 transition-colors ' +
  'placeholder:text-slate-400 focus:border-brand-600 focus:outline-none';

const NORMAL_BORDER = 'border-slate-300 bg-white';
const ERROR_BORDER = 'border-red-400 bg-red-50';

/**
 * Bọc label + control + thông báo lỗi.
 *
 * `aria-invalid` và `aria-describedby` để screen reader đọc được lỗi,
 * không chỉ dựa vào màu đỏ.
 */
function FieldShell({ id, label, error, hint, children }) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children({ errorId, hintId })}
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextField({ id, label, error, hint, className = '', ...rest }) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      {({ errorId, hintId }) => (
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`${CONTROL_CLASSES} ${error ? ERROR_BORDER : NORMAL_BORDER} ${className}`}
          {...rest}
        />
      )}
    </FieldShell>
  );
}

export function SelectField({ id, label, error, hint, options, className = '', ...rest }) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      {({ errorId, hintId }) => (
        <select
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`${CONTROL_CLASSES} ${error ? ERROR_BORDER : NORMAL_BORDER} ${className}`}
          {...rest}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}

export function TextAreaField({ id, label, error, hint, className = '', ...rest }) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      {({ errorId, hintId }) => (
        <textarea
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`${CONTROL_CLASSES} resize-y ${error ? ERROR_BORDER : NORMAL_BORDER} ${className}`}
          {...rest}
        />
      )}
    </FieldShell>
  );
}
