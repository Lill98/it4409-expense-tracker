/**
 * Smoke test toàn bộ API trên MongoDB in-memory — không cần Atlas, không cần
 * Postman. Chạy: npm run smoke
 *
 * Kiểm tra cả các yêu cầu của đề bài:
 *   - CRUD đầy đủ + xem chi tiết
 *   - lọc theo category
 *   - validate dữ liệu đầu vào
 *   - HTTP status code đúng
 *   - user A không đọc/sửa/xoá được dữ liệu của user B (IDOR)
 */
import { MongoMemoryServer } from 'mongodb-memory-server';

const PORT = 4999;

let failures = 0;
let checks = 0;

function check(label, condition, extra = '') {
  checks += 1;
  if (condition) {
    console.log(`  [32m✓[0m ${label}`);
  } else {
    failures += 1;
    console.log(`  [31m✗[0m ${label}${extra ? ` — ${extra}` : ''}`);
  }
}

function section(title) {
  console.log(`\n[1m${title}[0m`);
}

const baseUrl = `http://127.0.0.1:${PORT}`;

async function call(method, path, { token, body, origin } = {}) {
  const headers = {};
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (origin) {
    headers.Origin = origin;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  return {
    status: response.status,
    body: text ? JSON.parse(text) : null,
  };
}

async function main() {
  const mongo = await MongoMemoryServer.create();

  // Env phải được set TRƯỚC khi import config/env.js (nó đọc lúc load module).
  process.env.MONGO_URI = mongo.getUri('it4409-smoke');
  process.env.JWT_SECRET = 'smoke-test-secret-not-for-production';
  process.env.PORT = String(PORT);
  process.env.NODE_ENV = 'test';
  process.env.CORS_ORIGINS = 'http://localhost:5173';

  const { createApp } = await import('../src/app.js');
  const { connectDatabase, disconnectDatabase } = await import('../src/config/database.js');

  await connectDatabase();
  const server = createApp().listen(PORT);
  await new Promise((resolve) => server.once('listening', resolve));

  try {
    section('Health');
    const health = await call('GET', '/health');
    check('GET /health trả 200', health.status === 200, `nhận ${health.status}`);

    section('Đăng ký & đăng nhập');
    const registerAlice = await call('POST', '/api/auth/register', {
      body: { name: 'Alice', email: 'alice@sis.hust.edu.vn', password: 'password123' },
    });
    check('POST /api/auth/register trả 201', registerAlice.status === 201, `nhận ${registerAlice.status}`);
    check('response không chứa passwordHash', !JSON.stringify(registerAlice.body).includes('passwordHash'));
    const aliceToken = registerAlice.body?.data?.accessToken;
    check('register trả về accessToken', Boolean(aliceToken));

    const duplicate = await call('POST', '/api/auth/register', {
      body: { name: 'Alice again', email: 'alice@sis.hust.edu.vn', password: 'password123' },
    });
    check('email trùng trả 409', duplicate.status === 409, `nhận ${duplicate.status}`);

    const weakPassword = await call('POST', '/api/auth/register', {
      body: { name: 'Bob', email: 'bob@sis.hust.edu.vn', password: 'short' },
    });
    check('mật khẩu quá ngắn trả 400', weakPassword.status === 400, `nhận ${weakPassword.status}`);

    const wrongPassword = await call('POST', '/api/auth/login', {
      body: { email: 'alice@sis.hust.edu.vn', password: 'wrong-password' },
    });
    check('mật khẩu sai trả 401', wrongPassword.status === 401, `nhận ${wrongPassword.status}`);

    const unknownEmail = await call('POST', '/api/auth/login', {
      body: { email: 'nobody@sis.hust.edu.vn', password: 'password123' },
    });
    check(
      'email không tồn tại trả cùng message với mật khẩu sai (không liệt kê được user)',
      unknownEmail.body?.message === wrongPassword.body?.message,
    );

    const login = await call('POST', '/api/auth/login', {
      body: { email: 'alice@sis.hust.edu.vn', password: 'password123' },
    });
    check('POST /api/auth/login trả 200', login.status === 200, `nhận ${login.status}`);

    const me = await call('GET', '/api/auth/me', { token: aliceToken });
    check('GET /api/auth/me trả 200', me.status === 200, `nhận ${me.status}`);
    check('me trả đúng email', me.body?.data?.user?.email === 'alice@sis.hust.edu.vn');

    section('Bảo vệ route');
    const noToken = await call('GET', '/api/expenses');
    check('không có token trả 401', noToken.status === 401, `nhận ${noToken.status}`);

    const badToken = await call('GET', '/api/expenses', { token: 'not-a-real-jwt' });
    check('token rác trả 401', badToken.status === 401, `nhận ${badToken.status}`);

    section('NoSQL injection');
    const injection = await call('POST', '/api/auth/login', {
      body: { email: { $ne: null }, password: { $ne: null } },
    });
    check(
      'login với toán tử $ne bị chặn (400, không đăng nhập được)',
      injection.status === 400,
      `nhận ${injection.status}`,
    );

    section('Tạo & validate');
    const created = await call('POST', '/api/expenses', {
      token: aliceToken,
      body: {
        title: 'Ăn trưa',
        amount: 65000,
        category: 'food',
        paymentMethod: 'cash',
        date: '2026-07-20',
        note: 'Cơm gà',
      },
    });
    check('POST /api/expenses trả 201', created.status === 201, `nhận ${created.status}`);
    const expenseId = created.body?.data?.id;
    check('response có id', Boolean(expenseId));
    check('userId được gán tự động', Boolean(created.body?.data?.userId));

    const negativeAmount = await call('POST', '/api/expenses', {
      token: aliceToken,
      body: { title: 'Sai tiền', amount: -5000, category: 'food', date: '2026-07-20' },
    });
    check('amount âm trả 400', negativeAmount.status === 400, `nhận ${negativeAmount.status}`);

    const futureDate = await call('POST', '/api/expenses', {
      token: aliceToken,
      body: { title: 'Tương lai', amount: 10000, category: 'food', date: '2099-01-01' },
    });
    check('date ở tương lai trả 400', futureDate.status === 400, `nhận ${futureDate.status}`);

    const badCategory = await call('POST', '/api/expenses', {
      token: aliceToken,
      body: { title: 'Sai loại', amount: 10000, category: 'crypto', date: '2026-07-20' },
    });
    check('category ngoài enum trả 400', badCategory.status === 400, `nhận ${badCategory.status}`);

    const injectedUserId = await call('POST', '/api/expenses', {
      token: aliceToken,
      body: {
        title: 'Gán cho người khác',
        amount: 10000,
        category: 'food',
        date: '2026-07-20',
        userId: '000000000000000000000000',
      },
    });
    check(
      'client tự gửi userId bị từ chối 400 (chặn mass assignment)',
      injectedUserId.status === 400,
      `nhận ${injectedUserId.status}`,
    );

    section('Đọc, lọc, phân trang');
    await call('POST', '/api/expenses', {
      token: aliceToken,
      body: { title: 'Grab', amount: 45000, category: 'transport', date: '2026-07-21' },
    });
    await call('POST', '/api/expenses', {
      token: aliceToken,
      body: { title: 'Tiền điện', amount: 350000, category: 'bills', date: '2026-07-05' },
    });

    const listAll = await call('GET', '/api/expenses', { token: aliceToken });
    check('GET /api/expenses trả 200', listAll.status === 200, `nhận ${listAll.status}`);
    check('trả về 3 khoản chi', listAll.body?.data?.length === 3, `nhận ${listAll.body?.data?.length}`);
    check('có meta phân trang', listAll.body?.meta?.total === 3);

    const filtered = await call('GET', '/api/expenses?category=transport', { token: aliceToken });
    check('lọc theo category chỉ trả 1', filtered.body?.data?.length === 1, `nhận ${filtered.body?.data?.length}`);

    const dateRange = await call('GET', '/api/expenses?from=2026-07-20&to=2026-07-31', {
      token: aliceToken,
    });
    check('lọc theo khoảng ngày trả 2', dateRange.body?.data?.length === 2, `nhận ${dateRange.body?.data?.length}`);

    const searched = await call('GET', '/api/expenses?search=grab', { token: aliceToken });
    check('tìm theo tên (không phân biệt hoa thường) trả 1', searched.body?.data?.length === 1);

    const paged = await call('GET', '/api/expenses?page=1&limit=2', { token: aliceToken });
    check('limit=2 trả 2 item', paged.body?.data?.length === 2);
    check('meta.hasNextPage = true', paged.body?.meta?.hasNextPage === true);

    const badLimit = await call('GET', '/api/expenses?limit=9999', { token: aliceToken });
    check('limit vượt trần trả 400', badLimit.status === 400, `nhận ${badLimit.status}`);

    const unknownParam = await call('GET', '/api/expenses?hacker=1', { token: aliceToken });
    check('query param lạ trả 400', unknownParam.status === 400, `nhận ${unknownParam.status}`);

    section('Xem chi tiết');
    const detail = await call('GET', `/api/expenses/${expenseId}`, { token: aliceToken });
    check('GET /api/expenses/:id trả 200', detail.status === 200, `nhận ${detail.status}`);
    check('chi tiết đúng bản ghi', detail.body?.data?.title === 'Ăn trưa');

    const badId = await call('GET', '/api/expenses/not-an-object-id', { token: aliceToken });
    check('id sai định dạng trả 400', badId.status === 400, `nhận ${badId.status}`);

    const missingId = await call('GET', '/api/expenses/000000000000000000000000', {
      token: aliceToken,
    });
    check('id không tồn tại trả 404', missingId.status === 404, `nhận ${missingId.status}`);

    section('Cập nhật & xoá');
    const updated = await call('PUT', `/api/expenses/${expenseId}`, {
      token: aliceToken,
      body: {
        title: 'Ăn trưa (đã sửa)',
        amount: 70000,
        category: 'food',
        paymentMethod: 'ewallet',
        date: '2026-07-20',
        note: 'Sửa lại số tiền',
      },
    });
    check('PUT trả 200', updated.status === 200, `nhận ${updated.status}`);
    check('dữ liệu đã đổi', updated.body?.data?.amount === 70000);

    section('Thống kê (aggregation)');
    const summary = await call('GET', '/api/expenses/summary?month=2026-07', { token: aliceToken });
    check('GET /api/expenses/summary trả 200', summary.status === 200, `nhận ${summary.status}`);
    check(
      'tổng = 70000 + 45000 + 350000 = 465000',
      summary.body?.data?.total === 465000,
      `nhận ${summary.body?.data?.total}`,
    );
    check('có 3 category', summary.body?.data?.byCategory?.length === 3);
    check(
      'phần trăm được tính',
      summary.body?.data?.byCategory?.every((row) => typeof row.percentage === 'number'),
    );

    const badMonth = await call('GET', '/api/expenses/summary?month=2026-13', { token: aliceToken });
    check('month không hợp lệ trả 400', badMonth.status === 400, `nhận ${badMonth.status}`);

    section('Phân tách dữ liệu giữa các user (IDOR)');
    const registerBob = await call('POST', '/api/auth/register', {
      body: { name: 'Bob', email: 'bob2@sis.hust.edu.vn', password: 'password123' },
    });
    const bobToken = registerBob.body?.data?.accessToken;

    const bobList = await call('GET', '/api/expenses', { token: bobToken });
    check('Bob không thấy dữ liệu của Alice', bobList.body?.data?.length === 0, `nhận ${bobList.body?.data?.length}`);

    const bobReadsAlice = await call('GET', `/api/expenses/${expenseId}`, { token: bobToken });
    check(
      'Bob đọc bản ghi của Alice bằng id trực tiếp -> 404',
      bobReadsAlice.status === 404,
      `nhận ${bobReadsAlice.status}`,
    );

    const bobUpdatesAlice = await call('PUT', `/api/expenses/${expenseId}`, {
      token: bobToken,
      body: { title: 'Hacked', amount: 1, category: 'other', date: '2026-07-20' },
    });
    check('Bob sửa bản ghi của Alice -> 404', bobUpdatesAlice.status === 404, `nhận ${bobUpdatesAlice.status}`);

    const bobDeletesAlice = await call('DELETE', `/api/expenses/${expenseId}`, { token: bobToken });
    check('Bob xoá bản ghi của Alice -> 404', bobDeletesAlice.status === 404, `nhận ${bobDeletesAlice.status}`);

    const stillThere = await call('GET', `/api/expenses/${expenseId}`, { token: aliceToken });
    check('bản ghi của Alice vẫn còn nguyên', stillThere.status === 200);

    const bobSummary = await call('GET', '/api/expenses/summary?month=2026-07', { token: bobToken });
    check('thống kê của Bob = 0', bobSummary.body?.data?.total === 0, `nhận ${bobSummary.body?.data?.total}`);

    section('Xoá');
    const deleted = await call('DELETE', `/api/expenses/${expenseId}`, { token: aliceToken });
    check('DELETE trả 204', deleted.status === 204, `nhận ${deleted.status}`);
    check('204 không có body', deleted.body === null);

    const deletedAgain = await call('DELETE', `/api/expenses/${expenseId}`, { token: aliceToken });
    check('xoá lần hai trả 404', deletedAgain.status === 404, `nhận ${deletedAgain.status}`);

    section('CORS');
    const allowedOrigin = await call('GET', '/api/auth/me', {
      token: aliceToken,
      origin: 'http://localhost:5173',
    });
    check('origin trong allowlist được chấp nhận', allowedOrigin.status === 200, `nhận ${allowedOrigin.status}`);

    // Ở NODE_ENV=test (không phải production) mọi cổng localhost đều được phép,
    // vì Vite tự nhảy cổng khi 5173 bị chiếm.
    const otherLocalPort = await call('GET', '/api/auth/me', {
      token: aliceToken,
      origin: 'http://localhost:5174',
    });
    check('cổng localhost khác vẫn được phép khi dev', otherLocalPort.status === 200, `nhận ${otherLocalPort.status}`);

    const foreignOrigin = await call('GET', '/api/auth/me', {
      token: aliceToken,
      origin: 'https://evil.example.com',
    });
    check(
      'origin lạ bị từ chối 403 (không phải 500)',
      foreignOrigin.status === 403,
      `nhận ${foreignOrigin.status}`,
    );

    section('Route không tồn tại');
    const unknownRoute = await call('GET', '/api/nope');
    check('route lạ trả 404 dạng JSON', unknownRoute.status === 404 && unknownRoute.body?.success === false);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await disconnectDatabase();
    await mongo.stop();
  }

  console.log(
    `\n[1m${checks - failures}/${checks} kiểm tra đạt[0m`,
  );
  if (failures > 0) {
    console.log(`[31m${failures} kiểm tra THẤT BẠI[0m`);
    process.exit(1);
  }
  console.log('[32mTất cả kiểm tra đều đạt[0m');
}

main().catch((error) => {
  console.error('Smoke test lỗi:', error);
  process.exit(1);
});
