/**
 * Nạp tài khoản demo + dữ liệu mẫu vào database đang cấu hình trong .env
 * (thường là MongoDB Atlas).  Chạy: npm run seed
 */
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { env } from '../src/config/env.js';
import seedDemoData, { DEMO_ACCOUNT } from './seed-data.js';

async function main() {
  await connectDatabase();
  console.log(`Đã kết nối MongoDB (${env.nodeEnv})`);

  await seedDemoData();

  console.log('\nTài khoản demo để nộp bài:');
  console.log(`  Email:    ${DEMO_ACCOUNT.email}`);
  console.log(`  Password: ${DEMO_ACCOUNT.password}`);

  await disconnectDatabase();
}

main().catch(async (error) => {
  console.error('Seed thất bại:', error);
  await disconnectDatabase();
  process.exit(1);
});
