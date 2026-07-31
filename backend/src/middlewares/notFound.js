import { ApiError } from '../shared/ApiError.js';

/**
 * Bắt mọi route không khớp và đẩy vào errorHandler,
 * để URL sai cũng trả JSON đúng format thay vì trang HTML mặc định của Express.
 */
export function notFound(req, _res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}
