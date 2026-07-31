import { ApiError } from '../shared/ApiError.js';
import { env, isProduction } from './env.js';

// Bất kỳ cổng nào trên localhost/127.0.0.1 — chỉ dùng khi chạy dev.
const LOCALHOST_PATTERN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

/**
 * Quyết định một origin có được phép gọi API hay không.
 *
 * Production: chỉ đúng các domain khai báo trong CORS_ORIGINS.
 * Development: thêm mọi cổng localhost, vì Vite tự nhảy cổng khác khi
 * 5173 đã bị chiếm — nếu khoá cứng một cổng thì dev sẽ vỡ ngẫu nhiên.
 */
function isOriginAllowed(origin) {
  if (env.corsOrigins.includes(origin)) {
    return true;
  }
  return !isProduction && LOCALHOST_PATTERN.test(origin);
}

export const corsOptions = {
  origin(origin, callback) {
    // Không có header Origin = request không phải từ browser
    // (Postman, curl, server-to-server) — CORS không áp dụng.
    if (!origin) {
      return callback(null, true);
    }

    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }

    // Trả 403: đây là request bị từ chối, không phải lỗi của server.
    // Nếu truyền Error thường vào đây, errorHandler sẽ hiểu thành 500.
    return callback(ApiError.forbidden(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
};
