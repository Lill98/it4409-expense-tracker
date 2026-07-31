/**
 * Logic tạo tài khoản demo + dữ liệu mẫu, dùng chung cho:
 *   - scripts/seed.js              (nạp vào Atlas)
 *   - scripts/dev-with-memory-db.js (nạp vào DB in-memory)
 *
 * Idempotent: gọi nhiều lần không tạo trùng tài khoản.
 */
import bcrypt from 'bcryptjs';

import { env } from '../src/config/env.js';
import { User } from '../src/modules/users/user.model.js';
import { Expense } from '../src/modules/expenses/expense.model.js';

export const DEMO_ACCOUNT = {
  name: 'Demo Giang Vien',
  email: 'demo@sis.hust.edu.vn',
  password: 'Demo@12345',
};

/** Ngày cách hôm nay `daysAgo` ngày, chuẩn hoá về giữa trưa UTC. */
function daysBefore(daysAgo) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  date.setUTCHours(12, 0, 0, 0);
  return date;
}

const SAMPLE_EXPENSES = [
  { title: 'Ăn trưa cơm gà', amount: 65000, category: 'food', paymentMethod: 'cash', daysAgo: 1, note: 'Quán gần trường' },
  { title: 'Grab đi làm', amount: 48000, category: 'transport', paymentMethod: 'ewallet', daysAgo: 1 },
  { title: 'Cà phê với nhóm', amount: 55000, category: 'food', paymentMethod: 'card', daysAgo: 2 },
  { title: 'Tiền điện tháng này', amount: 420000, category: 'bills', paymentMethod: 'transfer', daysAgo: 3, note: 'Đã thanh toán online' },
  { title: 'Tiền nước', amount: 95000, category: 'bills', paymentMethod: 'transfer', daysAgo: 3 },
  { title: 'Mua sách Clean Code', amount: 185000, category: 'education', paymentMethod: 'card', daysAgo: 5, note: 'Sách tham khảo' },
  { title: 'Khoá học tiếng Anh', amount: 1200000, category: 'education', paymentMethod: 'transfer', daysAgo: 8 },
  { title: 'Áo sơ mi', amount: 320000, category: 'shopping', paymentMethod: 'card', daysAgo: 9 },
  { title: 'Thuốc cảm', amount: 78000, category: 'health', paymentMethod: 'cash', daysAgo: 11 },
  { title: 'Vé xem phim', amount: 120000, category: 'entertainment', paymentMethod: 'ewallet', daysAgo: 12, note: 'Suất chiếu tối' },
  { title: 'Xăng xe máy', amount: 90000, category: 'transport', paymentMethod: 'cash', daysAgo: 14 },
  { title: 'Đồ ăn sáng cả tuần', amount: 210000, category: 'food', paymentMethod: 'cash', daysAgo: 16 },
];

/**
 * Nạp dữ liệu mẫu. Giả định caller đã kết nối database.
 * @param {{ log?: boolean }} options
 */
export default async function seedDemoData({ log = true } = {}) {
  const say = (message) => {
    if (log) console.log(message);
  };

  let user = await User.findOne({ email: DEMO_ACCOUNT.email });

  if (user) {
    say(`Tài khoản demo đã tồn tại: ${DEMO_ACCOUNT.email}`);
  } else {
    const passwordHash = await bcrypt.hash(DEMO_ACCOUNT.password, env.bcryptRounds);
    user = await User.create({
      name: DEMO_ACCOUNT.name,
      email: DEMO_ACCOUNT.email,
      passwordHash,
    });
    say(`Đã tạo tài khoản demo: ${DEMO_ACCOUNT.email}`);
  }

  // Xoá dữ liệu cũ của riêng user demo rồi nạp lại, để mỗi lần seed
  // đều cho ra đúng một bộ dữ liệu mẫu sạch.
  const removed = await Expense.deleteMany({ userId: user._id });
  if (removed.deletedCount > 0) {
    say(`Đã xoá ${removed.deletedCount} khoản chi cũ của user demo`);
  }

  const documents = SAMPLE_EXPENSES.map(({ daysAgo, ...rest }) => ({
    ...rest,
    date: daysBefore(daysAgo),
    userId: user._id,
  }));

  await Expense.insertMany(documents);
  say(`Đã tạo ${documents.length} khoản chi mẫu`);

  return { user, expenseCount: documents.length };
}
