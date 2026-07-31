# Expense Tracker — Quản lý chi tiêu cá nhân

Bài thi cuối kỳ **IT4409 — Công nghệ Web và dịch vụ trực tuyến (20252)**
Chủ đề 3: Quản lý chi tiêu cá nhân (Expense Tracker)

| | |
|---|---|
| Học viên | Trần Tiến Quân |
| Mã số | 20242149M |
| Email | Quan.TT242149M@sis.hust.edu.vn |

---

## 1. Công nghệ sử dụng

| Tầng | Công nghệ |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4, React Router 7, Axios |
| Backend | Node.js 20, Express 4, Mongoose 8 |
| Database | MongoDB (Atlas) |
| Xác thực | JWT (jsonwebtoken) + bcryptjs |
| Validate | Zod (server) + validate thủ công (client) |
| Bảo mật | helmet, cors allowlist, express-rate-limit |
| Triển khai | Docker, Docker Compose, Nginx, GitHub Actions |

## 2. Kiến trúc

```
   Browser
      │ HTTPS
      ▼
 ┌─────────────────┐
 │ Cloudflare edge │   TLS, chống DDoS, hostname cố định
 └────────┬────────┘
          │  kết nối do cloudflared mở ĐI RA từ trong VM
╔═════════▼═══════════════════════════════════════════════╗
║  VM  —  không mở cổng vào, không cần IP public           ║
║                                                          ║
║  ┌──────────────┐                                        ║
║  │ cloudflared  │  connector của tunnel                  ║
║  └──────┬───────┘                                        ║
║         ▼                                                ║
║  ┌──────────────────────────┐                            ║
║  │ Nginx (frontend)         │  serve file tĩnh SPA       ║
║  │                          │  try_files → index.html    ║
║  │                          │  reverse proxy /api/*      ║
║  └──────┬───────────────────┘                            ║
║         ▼                                                ║
║  ┌──────────────────────────┐                            ║
║  │ Express API (3001)       │  không phơi ra Internet    ║
║  └──────┬───────────────────┘                            ║
║         ▼                                                ║
║  ┌──────────────────────────┐                            ║
║  │ MongoDB (volume)         │  không phơi ra Internet    ║
║  └──────────────────────────┘                            ║
╚══════════════════════════════════════════════════════════╝
```

Frontend và backend dùng **cùng một origin** (Nginx proxy `/api`), nên browser
không bao giờ gửi request cross-origin — không có preflight, không vướng CORS.

### Luồng một request (ví dụ `GET /api/expenses`)

```
Route  →  authenticate  →  validate(Zod)  →  Controller  →  Service  →  Repository  →  MongoDB
              │                 │                                            │
        gắn req.user      chặn field lạ                            luôn filter theo userId
        (từ JWT)          + sai kiểu
                                                                            │
        mọi lỗi ──────────────────────────────────────────────────►  errorHandler (duy nhất)
```

### Phân lớp backend

| Tầng | Trách nhiệm | Không được làm |
|---|---|---|
| Route | khai báo endpoint, gắn middleware | chứa logic |
| Middleware | xác thực, validate, rate limit, xử lý lỗi | biết về nghiệp vụ |
| Controller | đọc request đã validate, chọn status code | truy vấn DB, chứa nghiệp vụ |
| Service | nghiệp vụ, quyết định lỗi nào được ném | biết về `req`/`res` |
| Repository | truy vấn Mongoose | chứa nghiệp vụ |
| Model | schema, ràng buộc dữ liệu | — |

> **Ghi chú về cấu trúc thư mục.** Slide Lec 8 gợi ý nhóm theo *loại*
> (`controllers/`, `services/`, `models/`). Dự án này nhóm theo *tính năng*
> (`modules/auth/`, `modules/expenses/`) — vẫn đủ 6 tầng như trên, nhưng các
> file của cùng một tính năng nằm cạnh nhau. Sửa một tính năng chỉ mở một
> thư mục, thay vì nhảy qua 5 thư mục khác nhau.

## 3. Cấu trúc thư mục

```
expense-tracker/
├── backend/
│   ├── src/
│   │   ├── config/         env.js · database.js · cors.js
│   │   ├── constants/      httpStatus · expenseCategories · pagination
│   │   ├── middlewares/    authenticate · validate · errorHandler · notFound · rateLimiter
│   │   ├── shared/         ApiError · asyncHandler · apiResponse
│   │   ├── modules/
│   │   │   ├── auth/       routes · controller · service · validation · token.service
│   │   │   ├── users/      model · repository
│   │   │   └── expenses/   routes · controller · service · repository · model · validation
│   │   ├── routes.js       gắn toàn bộ module
│   │   ├── app.js          dựng Express app (không listen)
│   │   └── server.js       kết nối DB rồi listen
│   ├── scripts/            smoke-test · seed · seed-data · dev-with-memory-db
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── app/            App.jsx (router) · AppLayout.jsx
│   │   ├── features/
│   │   │   ├── auth/       AuthContext · auth.api · ProtectedRoute
│   │   │   └── expenses/   expense.api · expense.constants · expense.validation
│   │   │                   components/ · hooks/
│   │   ├── pages/          Login · Register · Dashboard · ExpenseDetail · ExpenseForm · NotFound
│   │   ├── shared/         api/httpClient · ui/ · utils/formatters
│   │   └── main.jsx
│   ├── nginx.conf
│   └── Dockerfile
│
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## 4. API

Mọi endpoint `/api/expenses/*` đều yêu cầu header `Authorization: Bearer <token>`.

| Method | Endpoint | Mô tả | Thành công |
|---|---|---|---|
| POST | `/api/auth/register` | Đăng ký | 201 |
| POST | `/api/auth/login` | Đăng nhập, trả access token | 200 |
| GET | `/api/auth/me` | Thông tin user hiện tại | 200 |
| GET | `/api/expenses` | Danh sách, có lọc + phân trang | 200 |
| GET | `/api/expenses/:id` | Xem chi tiết | 200 |
| POST | `/api/expenses` | Tạo mới | 201 |
| PUT | `/api/expenses/:id` | Cập nhật | 200 |
| DELETE | `/api/expenses/:id` | Xoá | 204 |
| GET | `/api/expenses/summary` | Thống kê tháng theo category | 200 |
| GET | `/health` | Healthcheck (không cần token) | 200 |

### Tham số lọc của `GET /api/expenses`

| Tham số | Kiểu | Ví dụ |
|---|---|---|
| `category` | enum | `?category=food` |
| `from` / `to` | date | `?from=2026-07-01&to=2026-07-31` |
| `search` | string | `?search=grab` |
| `sort` | enum | `?sort=-amount` |
| `page` / `limit` | number | `?page=2&limit=20` |

Theo quy tắc REST (Lec 7): **path param để định danh** resource,
**query param để lọc / sắp xếp / phân trang**.

### Mã trạng thái HTTP

| Mã | Khi nào |
|---|---|
| 200 | Đọc / cập nhật thành công |
| 201 | Tạo mới thành công |
| 204 | Xoá thành công, không có body |
| 400 | Dữ liệu vào sai (validate thất bại, id sai định dạng, query param lạ) |
| 401 | Thiếu token / token sai / token hết hạn / sai mật khẩu |
| 403 | Origin không được CORS cho phép |
| 404 | Không tìm thấy — **hoặc resource không thuộc user hiện tại** |
| 409 | Email đã được đăng ký |
| 429 | Vượt giới hạn rate limit |
| 500 | Lỗi không lường trước của server |

### Dạng response

```jsonc
// Thành công
{ "success": true, "data": { ... }, "meta": { ... } }

// Lỗi
{ "success": false, "message": "Validation failed",
  "errors": [ { "field": "amount", "message": "Amount must be at least 1" } ] }
```

## 5. Model dữ liệu

```js
User {
  _id, name, email (unique, lowercase),
  passwordHash (bcrypt, select: false),  // không bao giờ trả ra API
  createdAt, updatedAt
}

Expense {
  _id,
  userId        ObjectId → User, indexed, BẮT BUỘC
  title         String, ≤ 120 ký tự
  amount        Number, nguyên, ≥ 1
  category      enum: food|transport|bills|shopping|health|education|entertainment|other
  paymentMethod enum: cash|card|transfer|ewallet   (default: cash)
  date          Date, không được ở tương lai
  note          String, ≤ 200 ký tự
  createdAt, updatedAt
}

// Index ghép phục vụ truy vấn thực tế "chi tiêu của tôi, mới nhất trước"
Expense.index({ userId: 1, date: -1 })
```

## 6. Cách chạy

### 6.1. Chạy nhanh nhất — không cần MongoDB Atlas

Dùng MongoDB in-memory, có sẵn dữ liệu mẫu. Cần 2 terminal:

```bash
# Terminal 1 — backend
cd backend
npm install
npm run dev:memory          # API tại http://localhost:3001

# Terminal 2 — frontend
cd frontend
npm install
npm run dev                 # UI tại http://localhost:5173
```

Mở http://localhost:5173 và đăng nhập bằng tài khoản demo bên dưới.

> Nếu cổng 5173 đang bị chiếm, Vite tự nhảy sang 5174 — backend vẫn chấp nhận
> vì khi `NODE_ENV != production` mọi cổng `localhost` đều được CORS cho phép.

### 6.2. Chạy với MongoDB Atlas

```bash
cd backend
cp .env.example .env        # rồi điền MONGO_URI và JWT_SECRET
npm install
npm run seed                # tạo tài khoản demo + dữ liệu mẫu
npm run dev                 # http://localhost:3001
```

Sinh `JWT_SECRET` mạnh:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 6.3. Chạy / deploy toàn bộ bằng Docker Compose

Compose dựng đủ 4 service: `mongo`, `backend`, `frontend` (Nginx), `cloudflared`.
Không cần MongoDB Atlas — database chạy trong container với named volume.

```bash
cd expense-tracker
cp .env.example .env              # rồi điền giá trị thật
docker compose up -d --build
docker compose exec backend npm run seed   # tạo tài khoản demo
```

Kiểm tra ngay trên VM: `curl http://localhost:8080/health`

**Chạy thử không cần tunnel** (bỏ service `cloudflared`):

```bash
docker compose up -d --build mongo backend frontend
```

### Vì sao không service nào publish cổng ra Internet

| Service | Cổng ra host | Lý do |
|---|---|---|
| `mongo` | không có | Chỉ backend trong mạng nội bộ Docker gọi tới |
| `backend` | không có | Chỉ Nginx gọi tới (Lec 10: không phơi backend ra Internet) |
| `frontend` | `127.0.0.1:8080` | Chỉ loopback của VM, để `curl` gỡ lỗi — **không** phải `0.0.0.0` |
| `cloudflared` | không có | Tạo kết nối **đi ra**, nên VM không cần mở cổng vào |

Cloudflare Tunnel mở kết nối từ trong VM ra ngoài, nên không cần IP public,
không cần mở port trên firewall, và TLS do Cloudflare lo.

### 6.4. Kiểm thử

```bash
cd backend && npm run smoke     # 55 kiểm tra, tự dựng MongoDB in-memory
cd frontend && npm run build    # kiểm tra build production
```

Smoke test kiểm tra đủ: CRUD, lọc, phân trang, thống kê, validate,
mã trạng thái HTTP, CORS, NoSQL injection và **cách ly dữ liệu giữa các user**.

## 7. Tài khoản demo

| | |
|---|---|
| Email | `demo@sis.hust.edu.vn` |
| Mật khẩu | `Demo@12345` |

Tài khoản này được tạo bởi `npm run seed` (hoặc tự động khi chạy `npm run dev:memory`),
kèm 12 khoản chi mẫu trải trên nhiều category để khối thống kê có dữ liệu.

## 8. Đáp ứng yêu cầu của đề bài

### Yêu cầu chức năng

| Yêu cầu | Thực hiện |
|---|---|
| Tạo (Create) | `POST /api/expenses` · trang `/expenses/new` |
| Xem danh sách (Read/List) | `GET /api/expenses` · trang `/` |
| Xem chi tiết | `GET /api/expenses/:id` · trang `/expenses/:id` |
| Sửa (Update) | `PUT /api/expenses/:id` · trang `/expenses/:id/edit` |
| Xoá (Delete) | `DELETE /api/expenses/:id` · có hộp thoại xác nhận |
| Dữ liệu gắn `userId` | trường `userId` bắt buộc, lấy **từ JWT**, không bao giờ từ request |
| Mỗi user chỉ thấy dữ liệu của mình | mọi truy vấn ở repository đều filter theo `userId` |
| Trường phân loại/lọc | `category` (8 giá trị) + lọc theo khoảng ngày, tìm theo tên, sắp xếp |

### Yêu cầu phi chức năng

| Yêu cầu | Thực hiện |
|---|---|
| Responsive | Tailwind breakpoint: mobile dùng danh sách card, desktop dùng bảng; đã kiểm tra 390px và 1440px, không tràn ngang |
| Validate dữ liệu đầu vào | Zod ở server (`.strict()`) + validate ở client + ràng buộc ở Mongoose schema |
| Xử lý lỗi tập trung | một `errorHandler` duy nhất; controller chỉ `next(err)` nhờ `asyncHandler` |
| HTTP status code phù hợp | xem bảng ở mục 4 |

## 9. Ghi chú về bảo mật

| Rủi ro | Cách xử lý |
|---|---|
| **IDOR** | Truy vấn theo `{ _id, userId }`, không chỉ `_id`. Sửa id trên URL → **404** (không phải 403, để không tiết lộ id nào đang tồn tại) |
| **Mass assignment** | Zod `.strict()` — client gửi thêm `userId` bị từ chối 400 |
| **NoSQL injection** | Zod buộc đúng kiểu (`{"$ne": null}` là object → 400) + Mongoose `strict: 'throw'` |
| **Mật khẩu** | bcrypt (cost 10), `select: false`, không bao giờ xuất hiện trong response |
| **Liệt kê tài khoản** | Email sai và mật khẩu sai trả **cùng một** thông báo lỗi |
| **Brute force** | Rate limit: 20 lần/15 phút cho `/auth/*`, 300 lần/15 phút cho toàn API |
| **XSS** | React escape mọi giá trị nội suy theo mặc định; không dùng `dangerouslySetInnerHTML` |
| **CORS** | Allowlist tường minh, không dùng `*`; origin lạ → 403 |
| **Rò rỉ thông tin** | Không trả stack trace ở production; `server_tokens off` ở Nginx |
| **ReDoS** | Escape ký tự đặc biệt trước khi đưa chuỗi tìm kiếm vào `$regex` |
| **Secret** | Chỉ qua biến môi trường; `.env` nằm trong `.gitignore` |
| **Bề mặt tấn công của VM** | Không service nào publish cổng ra Internet; tunnel mở kết nối đi ra |
| **Giả mạo IP để vượt rate limit** | `TRUST_PROXY` khớp đúng số hop proxy — xem dưới |

### Về `TRUST_PROXY`

Rate limiter đếm theo IP client, mà IP đó lấy từ header `X-Forwarded-For`.
Header này do proxy thêm vào, nên phải nói cho Express biết **có bao nhiêu lớp
proxy đáng tin** ở phía trước:

| Giá trị | Khi nào | Hậu quả nếu đặt sai |
|---|---|---|
| `1` | Chạy trực tiếp, hoặc sau 1 lớp Nginx | — |
| `2` | Sau `cloudflared` + Nginx (cách deploy này) | — |

- **Đặt quá thấp** → Express lấy IP của proxy thay vì IP client, nên mọi người
  dùng bị gộp vào một counter → một người spam là cả lớp bị chặn.
- **Đặt quá cao** → Express tin phần `X-Forwarded-For` do client tự gửi, nên
  client bơm IP giả để reset counter → rate limit vô dụng.

Đã kiểm chứng với `TRUST_PROXY=2`: hai client khác IP có counter độc lập.

### Giới hạn đã biết

Access token lưu ở `localStorage`, nên nếu có lỗ hổng XSS thì token đọc được.
Slide Lec 9 nêu cách an toàn hơn: access token giữ trong memory + refresh token
đặt trong cookie `HttpOnly` + refresh token rotation. Dự án này chọn phương án
đơn giản hơn cho đúng phạm vi bài tập, và đánh đổi này là có ý thức —
bù lại bằng việc React tự escape output và không dùng `dangerouslySetInnerHTML`.

## 10. CI/CD

`.github/workflows/ci.yml` chạy trên mỗi push và pull request vào `main`:

```
backend:  npm ci → npm run smoke   (55 kiểm tra, MongoDB in-memory)
frontend: npm ci → lint → build
docker:   build cả 2 image         (chỉ chạy sau khi 2 job trên pass)
```
