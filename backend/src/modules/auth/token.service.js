import jwt from 'jsonwebtoken';

import { env } from '../../config/env.js';

/**
 * Ký access token. Payload chỉ chứa những gì không bí mật:
 * JWT chỉ được KÝ, không được MÃ HOÁ — ai có token cũng decode được payload
 * (Lec 9). Vì vậy không bao giờ đặt dữ liệu riêng tư vào đây.
 */
export function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id ?? user._id.toString(), email: user.email },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
}

/**
 * Xác thực chữ ký + thời hạn. Ném TokenExpiredError / JsonWebTokenError,
 * errorHandler sẽ dịch cả hai thành 401.
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret);
}
