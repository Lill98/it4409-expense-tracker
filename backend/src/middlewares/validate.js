import { ApiError } from '../shared/ApiError.js';

/**
 * Chạy Zod schema trên một phần của request và ghi lại giá trị đã được
 * parse (đã ép kiểu, đã cắt khoảng trắng, đã áp default).
 *
 * Quan trọng về bảo mật: Zod `.strict()` loại bỏ field lạ, nên client không
 * thể chèn thêm khoá vào payload — chặn cả mass assignment (ví dụ tự gửi
 * `userId`) và NoSQL injection kiểu `{"$ne": null}` vì kiểu phải là string.
 */
export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || source,
        message: issue.message,
      }));
      return next(ApiError.badRequest('Validation failed', details));
    }

    // `req.query` là getter chỉ đọc ở Express 5; ghi vào chỗ riêng cho an toàn.
    if (source === 'query') {
      req.validatedQuery = result.data;
    } else {
      req[source] = result.data;
    }

    return next();
  };
}
