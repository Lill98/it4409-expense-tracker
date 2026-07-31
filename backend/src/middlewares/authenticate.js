import { ApiError } from '../shared/ApiError.js';
import { verifyAccessToken } from '../modules/auth/token.service.js';

const BEARER_PREFIX = 'Bearer ';

/**
 * Đọc `Authorization: Bearer <token>`, xác thực chữ ký, rồi gắn danh tính
 * đã được xác thực vào `req.user`.
 *
 * Đây là NGUỒN DUY NHẤT cho userId trong toàn bộ app. Không có tầng nào
 * được phép lấy userId từ body/params/query — đó chính là cách chặn IDOR:
 * client sửa ID trên URL cũng không đổi được chủ sở hữu của truy vấn.
 */
export function authenticate(req, _res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith(BEARER_PREFIX)) {
    return next(ApiError.unauthorized('Missing Bearer token'));
  }

  const token = header.slice(BEARER_PREFIX.length).trim();
  if (!token) {
    return next(ApiError.unauthorized('Missing Bearer token'));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch (error) {
    // errorHandler biết cách dịch TokenExpiredError / JsonWebTokenError sang 401.
    return next(error);
  }
}
