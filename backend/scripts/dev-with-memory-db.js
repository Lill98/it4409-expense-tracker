/**
 * Chạy backend với MongoDB in-memory — để thử toàn bộ app khi chưa kịp
 * tạo cluster trên Atlas.  Chạy: npm run dev:memory
 *
 * Dữ liệu MẤT khi tắt process. Chỉ dùng cho phát triển/demo cục bộ.
 */
import { MongoMemoryServer } from 'mongodb-memory-server';

const mongo = await MongoMemoryServer.create();

process.env.MONGO_URI = mongo.getUri('it4409-db');
process.env.JWT_SECRET ??= 'dev-only-secret-do-not-use-in-production';
process.env.PORT ??= '3001';
process.env.NODE_ENV ??= 'development';

console.log('MongoDB in-memory đã khởi động (dữ liệu sẽ mất khi tắt)');

const { connectDatabase } = await import('../src/config/database.js');
const { createApp } = await import('../src/app.js');
const { env } = await import('../src/config/env.js');

await connectDatabase();

// Nạp dữ liệu mẫu để mở app lên là có sẵn thứ để xem.
const { default: seed } = await import('./seed-data.js');
await seed();

createApp().listen(env.port, () => {
  console.log(`API running on http://localhost:${env.port} [in-memory DB]`);
  console.log('Đăng nhập demo: demo@sis.hust.edu.vn / Demo@12345');
});

const shutdown = async () => {
  await mongo.stop();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
