import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ApiError } from '../shared/ApiError.js';
import { isProduction } from '../config/env.js';

const DUPLICATE_KEY_CODE = 11000;

/**
 * Dịch lỗi của thư viện thành ApiError để phần còn lại chỉ làm một việc:
 * đọc statusCode rồi trả JSON. Không có chỗ nào khác trong app được
 * tự quyết định status code cho lỗi.
 */
function normalizeError(error) {
  if (error instanceof ApiError) {
    return error;
  }

  // Vi phạm schema Mongoose, ví dụ amount < 1 hoặc category ngoài enum.
  if (error instanceof mongoose.Error.ValidationError) {
    const details = Object.values(error.errors).map((fieldError) => ({
      field: fieldError.path,
      message: fieldError.message,
    }));
    return ApiError.badRequest('Validation failed', details);
  }

  // :id trên URL không phải ObjectId hợp lệ -> đây là lỗi client, không phải 500.
  if (error instanceof mongoose.Error.CastError) {
    return ApiError.badRequest(`Invalid value for "${error.path}"`);
  }

  // Unique index, ở đây chỉ có email.
  if (error.code === DUPLICATE_KEY_CODE) {
    const field = Object.keys(error.keyPattern ?? {})[0] ?? 'field';
    return ApiError.conflict(`${field} already exists`);
  }

  if (error instanceof jwt.TokenExpiredError) {
    return ApiError.unauthorized('Token has expired');
  }

  if (error instanceof jwt.JsonWebTokenError) {
    return ApiError.unauthorized('Invalid token');
  }

  // Body không phải JSON hợp lệ (express.json bắn ra).
  if (error.type === 'entity.parse.failed') {
    return ApiError.badRequest('Request body must be valid JSON');
  }

  return new ApiError(
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    error.message || 'Internal Server Error',
  );
}

/**
 * Error-handling middleware — phải nhận đúng 4 tham số để Express
 * nhận diện, và phải là middleware cuối cùng được đăng ký.
 */
// eslint-disable-next-line no-unused-vars -- `next` bắt buộc phải có để Express nhận diện
export function errorHandler(error, req, res, next) {
  const apiError = normalizeError(error);

  // Lỗi 5xx là bug của mình -> luôn log stack. Lỗi 4xx là input sai -> không cần.
  if (apiError.statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    console.error(`[${req.method} ${req.originalUrl}]`, error);
  }

  const body = {
    success: false,
    message: apiError.message,
  };

  if (apiError.details) {
    body.errors = apiError.details;
  }

  // Không bao giờ để lộ stack trace ra production.
  if (!isProduction && apiError.statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    body.stack = error.stack;
  }

  return res.status(apiError.statusCode).json(body);
}
