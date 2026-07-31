import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { corsOptions } from './config/cors.js';
import { env, isProduction } from './config/env.js';
import { HTTP_STATUS } from './constants/httpStatus.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFound } from './middlewares/notFound.js';
import apiRoutes from './routes.js';

const JSON_BODY_LIMIT = '100kb';

/**
 * Dựng Express app mà KHÔNG kết nối DB và KHÔNG listen.
 * Tách như vậy để smoke test dùng lại được app với DB in-memory.
 */
export function createApp() {
  const app = express();

  // Nằm sau reverse proxy nên cần tin X-Forwarded-For để lấy đúng IP client.
  // Số hop phải khớp thực tế: đặt thấp thì rate limiter gộp mọi user vào
  // cùng một IP (chặn oan); đặt cao thì client tự bơm XFF giả để vượt giới hạn.
  app.set('trust proxy', env.trustProxy);

  app.use(helmet());
  // Chỉ cho phép đúng các origin đã khai báo, không dùng '*' (xem config/cors.js).
  app.use(cors(corsOptions));

  // Giới hạn kích thước body để một request khổng lồ không làm cạn RAM.
  app.use(express.json({ limit: JSON_BODY_LIMIT }));
  app.use(morgan(isProduction ? 'combined' : 'dev'));

  // Healthcheck đặt trước rate limiter để Docker/Render probe không bị chặn.
  app.get('/health', (_req, res) =>
    res.status(HTTP_STATUS.OK).json({ status: 'ok', uptime: process.uptime() }),
  );

  app.use('/api', apiLimiter, apiRoutes);

  // Hai middleware này phải ở cuối, và errorHandler phải là cuối cùng.
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
