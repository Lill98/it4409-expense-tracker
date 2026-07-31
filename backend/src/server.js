import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';

/**
 * Điểm khởi động. Kết nối DB TRƯỚC khi listen, để app không bao giờ
 * nhận request trong lúc chưa có database.
 */
async function bootstrap() {
  await connectDatabase();
  console.log('Connected to MongoDB');

  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`API running on http://localhost:${env.port} [${env.nodeEnv}]`);
  });

  // Tắt êm: đóng listener rồi ngắt DB, để request đang chạy được hoàn tất
  // và container không bị Docker kill cứng.
  const shutdown = async (signal) => {
    console.log(`\n${signal} received, shutting down`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
