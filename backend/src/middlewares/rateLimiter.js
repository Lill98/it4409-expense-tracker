import rateLimit from 'express-rate-limit';

import { HTTP_STATUS } from '../constants/httpStatus.js';

const MINUTE = 60 * 1000;

/** Giới hạn chung cho toàn bộ API, chống lạm dụng (Lec 9 - Rate Limiting). */
export const apiLimiter = rateLimit({
  windowMs: 15 * MINUTE,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please slow down' },
});

/**
 * Giới hạn chặt hơn cho login/register — đây là nơi bị brute-force mật khẩu.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * MINUTE,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
  },
});
