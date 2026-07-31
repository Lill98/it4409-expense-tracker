import { HTTP_STATUS } from '../constants/httpStatus.js';

/**
 * Lỗi có chủ đích của tầng nghiệp vụ.
 * Service/controller chỉ cần `throw new ApiError(...)`, errorHandler
 * ở cuối chuỗi middleware lo việc dịch sang HTTP response.
 */
export class ApiError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    // Đánh dấu lỗi "dự kiến" để errorHandler không log stack như lỗi hệ thống.
    this.isOperational = true;
  }

  static badRequest(message, details) {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, message, details);
  }

  static unauthorized(message = 'Authentication required') {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, message);
  }

  static forbidden(message = 'You do not have access to this resource') {
    return new ApiError(HTTP_STATUS.FORBIDDEN, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(HTTP_STATUS.NOT_FOUND, message);
  }

  static conflict(message) {
    return new ApiError(HTTP_STATUS.CONFLICT, message);
  }
}
