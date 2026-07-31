# ĐỀ THI CUỐI KỲ — IT4409 (20252)

## Công nghệ Web và dịch vụ trực tuyến

---

## 1. Thông tin học viên

| | |
|---|---|
| **Họ tên** | Trần Tiến Quân |
| **Mã số học viên** | 20242149M |
| **Email** | Quan.TT242149M@sis.hust.edu.vn |
| **Chủ đề đã chọn** | Đề số 3 — Quản lý chi tiêu cá nhân (Expense Tracker) |

---

## 2. Liên kết

| | |
|---|---|
| **Source code** | https://github.com/Lill98/it4409-expense-tracker |
| **Demo đã triển khai** | https://web.quanaibuilder.com |

Sản phẩm đang chạy trên VM cá nhân (Google Cloud, Debian 12), triển khai bằng
Docker Compose gồm 4 container, đưa ra Internet qua Cloudflare Tunnel với HTTPS.
Chi tiết cách triển khai ở **mục 8**.

## 3. Tài khoản demo

| | |
|---|---|
| **Email** | `demo@sis.hust.edu.vn` |
| **Mật khẩu** | `Demo@12345` |

Tài khoản có sẵn 12 khoản chi mẫu thuộc 7 phân loại khác nhau, để khối
thống kê và các bộ lọc đều có dữ liệu ngay khi đăng nhập.

Có thể tự đăng ký tài khoản mới để kiểm chứng yêu cầu *"mỗi user chỉ thấy dữ
liệu của chính mình"*: tài khoản mới sẽ thấy danh sách trống hoàn toàn.

---

## 4. Mô tả chức năng

### 4.1. Xác thực

| Chức năng | Mô tả |
|---|---|
| Đăng ký | Họ tên, email, mật khẩu (≥ 8 ký tự). Mật khẩu băm bằng bcrypt trước khi lưu |
| Đăng nhập | Trả về JWT access token, lưu ở phía client |
| Duy trì phiên | Tải lại trang vẫn giữ đăng nhập; token hết hạn thì tự đăng xuất |
| Đăng xuất | Xoá token khỏi client |

### 4.2. Quản lý chi tiêu (CRUD)

| Chức năng | Đường dẫn | Mô tả |
|---|---|---|
| **Xem danh sách** | `/` | Bảng trên desktop, danh sách card trên mobile. Có phân trang 10 bản ghi/trang |
| **Xem chi tiết** | `/expenses/:id` | Trang riêng: số tiền, phân loại, ngày, hình thức thanh toán, ghi chú, thời điểm tạo/sửa |
| **Tạo mới** | `/expenses/new` | Form có validate; tạo xong chuyển sang trang chi tiết |
| **Sửa** | `/expenses/:id/edit` | Cùng form với tạo mới, nạp sẵn dữ liệu hiện có |
| **Xoá** | — | Có hộp thoại xác nhận, nêu rõ không thể hoàn tác |

### 4.3. Lọc, tìm kiếm, sắp xếp

| Tiêu chí | Mô tả |
|---|---|
| **Phân loại** (`category`) | 8 giá trị: Ăn uống, Di chuyển, Hoá đơn, Mua sắm, Sức khoẻ, Học tập, Giải trí, Khác |
| Khoảng ngày | Từ ngày — Đến ngày |
| Tìm kiếm | Theo tên khoản chi, không phân biệt hoa/thường |
| Sắp xếp | Mới nhất, Cũ nhất, Tiền nhiều nhất, Tiền ít nhất |

Trạng thái lọc được lưu trong URL query string, nên F5 hay bấm Back vẫn giữ
đúng những gì đang xem, và có thể chia sẻ link kèm bộ lọc.

### 4.4. Thống kê

Khối thống kê tính tổng chi trong tháng, chia theo phân loại, kèm tỷ lệ phần
trăm và thanh tiến trình. Có thể chọn tháng bất kỳ.

Phần tính toán do **MongoDB aggregation pipeline** thực hiện ở backend
(`$match` → `$group` → `$project` → `$sort`), không phải tính ở frontend, để
không phải tải toàn bộ dữ liệu về client.

---

## 5. Công nghệ đã sử dụng

| Tầng | Công nghệ | Vai trò |
|---|---|---|
| Frontend | **React 19** | Xây UI theo component |
| | **Vite** | Build tool, dev server |
| | **Tailwind CSS 4** | Styling, responsive |
| | **React Router 7** | Định tuyến client-side (SPA) |
| | **Axios** | Gọi HTTP API, interceptor gắn token và chuẩn hoá lỗi |
| | **Context API** | Chia sẻ trạng thái đăng nhập, tránh prop drilling |
| Backend | **Node.js 20** | Runtime |
| | **Express 4** | HTTP server, routing, middleware |
| | **Mongoose 8** | ODM, schema, validate ở tầng dữ liệu |
| | **Zod** | Validate request |
| | **jsonwebtoken** | Ký và xác thực JWT |
| | **bcryptjs** | Băm mật khẩu |
| | **helmet, cors, express-rate-limit** | Bảo mật HTTP header, CORS allowlist, chống brute-force |
| Database | **MongoDB 7** | Lưu dữ liệu, chạy trong container với named volume |
| Triển khai | **Docker, Docker Compose** | Đóng gói, chuẩn hoá môi trường, dựng cả stack bằng 1 lệnh |
| | **Nginx** | Serve file tĩnh, reverse proxy `/api`, xử lý routing SPA |
| | **Cloudflare Tunnel** | Đưa app ra Internet mà không mở cổng nào trên VM |
| | **GitHub Actions** | CI: test, lint, build image |

---

## 6. Sơ đồ kiến trúc

### 6.1. Kiến trúc triển khai

```
   Browser
      │ HTTPS
      ▼
 ┌─────────────────┐
 │ Cloudflare edge │  TLS, hostname cố định, chống DDoS
 └────────┬────────┘
          │  kết nối do cloudflared mở ĐI RA từ trong VM
╔═════════▼═══════════════════════════════════════════════╗
║  VM  —  không mở cổng vào, không cần IP public           ║
║                                                          ║
║  ┌──────────────┐                                        ║
║  │ cloudflared  │  connector của Cloudflare Tunnel       ║
║  └──────┬───────┘                                        ║
║         ▼                                                ║
║  ┌──────────────────────────┐                            ║
║  │ Nginx  (frontend)        │  serve file tĩnh của SPA   ║
║  │                          │  try_files → index.html    ║
║  │                          │  reverse proxy /api/*      ║
║  └──────┬───────────────────┘                            ║
║         ▼                                                ║
║  ┌──────────────────────────┐                            ║
║  │ Express API  (3001)      │  KHÔNG phơi ra Internet    ║
║  └──────┬───────────────────┘                            ║
║         ▼                                                ║
║  ┌──────────────────────────┐                            ║
║  │ MongoDB  (named volume)  │  KHÔNG phơi ra Internet    ║
║  └──────────────────────────┘                            ║
╚══════════════════════════════════════════════════════════╝

  4 container, dựng bằng một lệnh `docker compose up -d --build`
```

Ba điểm thiết kế:

1. **Không service nào publish cổng ra Internet.** Cloudflare Tunnel mở kết nối
   *đi ra* từ trong VM, nên VM không cần IP public, không cần mở port trên
   firewall, và không phải tự quản lý chứng chỉ TLS.
2. **Backend và database chỉ nghe trong mạng nội bộ Docker.** Mọi request bắt
   buộc đi qua Nginx (Lec 10: không phơi backend trực tiếp ra Internet).
3. **Frontend và backend cùng một origin.** Nginx proxy `/api` nên browser
   không bao giờ gửi request cross-origin — không preflight, không vướng CORS.

### 6.2. Phân lớp backend

```
  HTTP Request
       │
       ▼
  ┌─────────────┐
  │   Route     │  khai báo endpoint, gắn middleware
  └──────┬──────┘
         ▼
  ┌─────────────┐
  │ authenticate│  xác thực JWT → gắn req.user
  └──────┬──────┘   (NGUỒN DUY NHẤT của userId)
         ▼
  ┌─────────────┐
  │  validate   │  Zod .strict() → loại field lạ, sai kiểu
  └──────┬──────┘
         ▼
  ┌─────────────┐
  │ Controller  │  đọc request, chọn HTTP status. KHÔNG chứa nghiệp vụ
  └──────┬──────┘
         ▼
  ┌─────────────┐
  │  Service    │  nghiệp vụ. Quyết định lỗi nào được ném
  └──────┬──────┘
         ▼
  ┌─────────────┐
  │ Repository  │  truy vấn Mongoose. LUÔN filter theo userId
  └──────┬──────┘
         ▼
  ┌─────────────┐
  │   Model     │  schema, ràng buộc dữ liệu
  └──────┬──────┘
         ▼
     MongoDB

  Mọi lỗi ở bất kỳ tầng nào ──► errorHandler (DUY NHẤT) ──► JSON response
```

### 6.3. Luồng xác thực

```
1. Client  POST /api/auth/login { email, password }
2. Server  tìm user → bcrypt.compare(password, passwordHash)
3. Server  ký JWT { sub: userId, email }, trả về client
4. Client  lưu token, Axios request interceptor tự gắn vào mọi request sau
              Authorization: Bearer <token>
5. Server  middleware authenticate xác thực chữ ký → req.user = { id, email }
6. Server  mọi truy vấn dùng req.user.id, KHÔNG BAO GIỜ lấy userId từ request
```

Bước 6 là điểm cốt lõi: vì userId chỉ đến từ token đã được xác thực chữ ký,
người dùng không thể đổi nó bằng cách sửa URL hay body.

### 6.4. Model dữ liệu

```
┌────────────────────────┐          ┌──────────────────────────────────┐
│         User           │  1     n │            Expense               │
├────────────────────────┤─────────►├──────────────────────────────────┤
│ _id                    │          │ _id                              │
│ name                   │          │ userId  → User  (indexed)        │
│ email        (unique)  │          │ title           ≤ 120 ký tự      │
│ passwordHash (bcrypt,  │          │ amount          nguyên, ≥ 1      │
│               ẩn khỏi  │          │ category        enum (8 giá trị) │
│               response)│          │ paymentMethod   enum (4 giá trị) │
│ createdAt, updatedAt   │          │ date            không ở tương lai│
└────────────────────────┘          │ note            ≤ 200 ký tự      │
                                    │ createdAt, updatedAt             │
                                    └──────────────────────────────────┘

Index: { userId: 1, date: -1 }   — phục vụ truy vấn "chi tiêu của tôi, mới nhất trước"
```

---

## 7. Hướng dẫn chạy

### 7.1. Chạy nhanh nhất — không cần cài MongoDB

Backend tự dựng MongoDB in-memory và nạp sẵn dữ liệu mẫu. Cần 2 terminal:

```bash
# Terminal 1
cd backend
npm install
npm run dev:memory          # API  → http://localhost:3001

# Terminal 2
cd frontend
npm install
npm run dev                 # UI   → http://localhost:5173
```

Mở http://localhost:5173, đăng nhập bằng tài khoản demo ở mục 3.

### 7.2. Chạy toàn bộ bằng Docker Compose (cách deploy thật)

Dựng đủ 4 container: MongoDB, backend, Nginx, cloudflared. Không cần cài
MongoDB trên máy — database chạy trong container, dữ liệu lưu ở named volume.

```bash
cp .env.example .env                        # rồi điền giá trị thật
docker compose up -d --build
docker compose exec backend npm run seed    # tạo tài khoản demo
```

Kiểm tra: `curl http://localhost:8080/health`

Chạy thử **không cần tunnel** (bỏ service `cloudflared`):

```bash
docker compose up -d --build mongo backend frontend
```

### 7.3. Kiểm thử

```bash
cd backend  && npm run smoke   # 55 kiểm tra tự động
cd frontend && npm run build   # kiểm tra build production
```

---

## 8. Cách triển khai

Sản phẩm đang chạy trên VM cá nhân (Google Cloud, Debian 12, 2 vCPU / 8GB RAM).
Phần này ghi lại toàn bộ quy trình để có thể tái lập trên bất kỳ máy nào.

### Bước 1 — Tạo tunnel trên Cloudflare

1. Vào https://one.dash.cloudflare.com → **Networks** → **Tunnels** → **Create a tunnel**
2. Chọn loại **Cloudflared**, đặt tên (ví dụ `it4409`)
3. Ở trang **Install and run a connector**, copy **token** trong lệnh mẫu
   (chuỗi rất dài sau `--token`). Chưa cần chạy lệnh đó.
4. Sang tab **Public Hostname** → **Add a public hostname**:

   | Trường | Giá trị |
   |---|---|
   | Subdomain | ví dụ `it4409` |
   | Domain | domain bạn có trên Cloudflare |
   | Type | `HTTP` |
   | URL | `frontend:80` |

   > `frontend` là **service name** trong `docker-compose.yml`. cloudflared chạy
   > cùng mạng Docker nên phân giải được tên này. Không dùng `localhost` —
   > trong container đó `localhost` là chính nó, không phải Nginx.

5. Ghi lại hostname đầy đủ, ví dụ `https://it4409.example.com`

### Bước 2 — Lấy code lên VM

```bash
ssh <user>@<vm>
git clone https://github.com/Lill98/it4409-expense-tracker.git
cd it4409-expense-tracker
```

### Bước 3 — Cấu hình biến môi trường trên VM

```bash
cp .env.example .env
nano .env
```

Điền 5 giá trị:

| Biến | Cách lấy |
|---|---|
| `MONGO_ROOT_USERNAME` | tự đặt, ví dụ `it4409` |
| `MONGO_ROOT_PASSWORD` | `openssl rand -base64 24 \| tr -d '/+=' \| head -c 24` |
| `JWT_SECRET` | `openssl rand -hex 48` |
| `TUNNEL_TOKEN` | token ở bước 1 |
| `PUBLIC_URL` | hostname ở bước 1, **không** có dấu `/` ở cuối |

File `.env` đã nằm trong `.gitignore` nên không bao giờ bị commit.

### Bước 4 — Dựng stack

```bash
docker compose up -d --build
docker compose exec backend npm run seed    # tạo tài khoản demo
```

Kiểm tra 4 container đều `Up` (riêng `mongo`, `backend`, `frontend` phải `healthy`):

```bash
docker compose ps
curl http://localhost:8080/health           # {"status":"ok",...}
docker compose logs cloudflared | tail -20  # phải thấy "Registered tunnel connection"
```

Log của `cloudflared` khi **thành công** phải có dòng:

```
INF Registered tunnel connection  connIndex=0 ...
```

### Chẩn đoán khi lỗi

| Hiện tượng trong log / triệu chứng | Nguyên nhân | Cách sửa |
|---|---|---|
| `Provided Tunnel token is not valid` | `TUNNEL_TOKEN` sai hoặc bị cắt cụt | Copy lại token đầy đủ từ Cloudflare, không để lọt khoảng trắng hay dấu ngoặc |
| `cloudflared` không start, `dependency failed to start ... frontend is unhealthy` | Nginx chưa healthy | `docker compose logs frontend`; kiểm tra `docker compose ps` |
| Mở hostname ra lỗi `502 Bad Gateway` | Public Hostname trong Cloudflare trỏ sai | Phải là `frontend:80`, **không** phải `localhost:80` |
| Trang load được nhưng đăng nhập lỗi | Backend không kết nối được MongoDB | `docker compose logs backend`; kiểm tra `MONGO_ROOT_*` trong `.env` |
| Đăng nhập được nhưng danh sách trống | Chưa seed | `docker compose exec backend npm run seed` |
| Reload URL sâu ra 404 | `try_files` của Nginx không hoạt động | Kiểm tra `frontend/nginx.conf` đã được copy vào image |

### Bước 5 — Kết quả kiểm tra sau khi triển khai

Đã xác nhận trên bản đang chạy tại https://web.quanaibuilder.com:

| Kiểm tra | Kết quả |
|---|---|
| 4 container | `Up`, ba container `mongo`/`backend`/`frontend` ở trạng thái `healthy` |
| `cloudflared` | `Registered tunnel connection`, 4 kết nối tới Cloudflare |
| `GET /` qua HTTPS | 200 |
| `POST /api/auth/login` | 200 |
| `GET /api/expenses` | 200, trả về 12 khoản chi mẫu |
| Gọi API không kèm token | 401 |
| Reload trực tiếp URL sâu `/expenses/:id` | 200 (Nginx `try_files` hoạt động) |
| Giao diện desktop 1440px | Bảng dữ liệu, đầy đủ CRUD + lọc + thống kê |
| Giao diện mobile 390px | Đổi sang danh sách card, không tràn ngang (0px) |
| Lỗi JavaScript trên console | Không có |
| Tài khoản mới đăng ký | Thấy danh sách trống — xác nhận dữ liệu được cách ly theo user |

### Vận hành

| Việc | Lệnh |
|---|---|
| Xem log | `docker compose logs -f backend` |
| Restart 1 service | `docker compose restart backend` |
| Cập nhật code mới | `git pull && docker compose up -d --build` |
| Dừng (giữ dữ liệu) | `docker compose down` |
| Dừng và **xoá sạch dữ liệu** | `docker compose down -v` ⚠️ |
| Backup database | `docker compose exec mongo mongodump --archive=/tmp/db.gz --gzip -u $MONGO_ROOT_USERNAME -p $MONGO_ROOT_PASSWORD --authenticationDatabase admin` |

> **Trước giờ vấn đáp**: chạy `docker compose ps` để chắc 4 container còn sống,
> và mở link demo một lần từ điện thoại để xác nhận tunnel còn thông. Container
> có `restart: unless-stopped` nên tự sống lại khi VM reboot, nhưng vẫn nên kiểm
> tra bằng mắt.

---

## 9. Đáp ứng yêu cầu của đề bài

### Yêu cầu chức năng

| Yêu cầu | Đáp ứng |
|---|---|
| Tạo (Create) | ✅ `POST /api/expenses` — trang `/expenses/new` |
| Xem danh sách (Read/List) | ✅ `GET /api/expenses` — trang `/`, có phân trang |
| Xem chi tiết | ✅ `GET /api/expenses/:id` — trang `/expenses/:id` |
| Sửa (Update) | ✅ `PUT /api/expenses/:id` — trang `/expenses/:id/edit` |
| Xoá (Delete) | ✅ `DELETE /api/expenses/:id` — có xác nhận |
| Dữ liệu gắn `userId` | ✅ Trường `userId` bắt buộc, lấy từ JWT |
| Mỗi user chỉ thấy dữ liệu của mình | ✅ Mọi truy vấn filter theo `userId`; đã kiểm chứng bằng 5 test tự động |
| Có ít nhất 1 trường phân loại/lọc | ✅ `category` (8 giá trị), thêm lọc theo ngày, tìm kiếm, sắp xếp |

### Yêu cầu phi chức năng

| Yêu cầu | Đáp ứng |
|---|---|
| Giao diện responsive | ✅ Mobile dùng danh sách card, desktop dùng bảng. Đã kiểm tra 390px và 1440px, không tràn ngang |
| Có validate dữ liệu đầu vào | ✅ 3 lớp: client (phản hồi tức thì) → Zod ở server → ràng buộc Mongoose |
| Xử lý lỗi tập trung | ✅ Một `errorHandler` duy nhất; controller chỉ `next(err)` |
| HTTP status code phù hợp | ✅ 200/201/204/400/401/403/404/409/429/500 |

### Nội dung nộp bài

| Yêu cầu | Vị trí |
|---|---|
| Thông tin học viên | Mục 1 |
| Mô tả chức năng | Mục 4 |
| Hướng dẫn chạy | Mục 7 |
| Sơ đồ kiến trúc | Mục 6 |
| Công nghệ đã sử dụng | Mục 5 |
| Link source code | Mục 2 |
| Link demo đã triển khai | Mục 2 |
| Tài khoản demo | Mục 3 |

---

## 10. Kiểm thử tự động

`backend/scripts/smoke-test.js` chạy **55 kiểm tra** trên MongoDB in-memory —
không cần Atlas, không cần Postman:

```bash
cd backend && npm run smoke
```

Nội dung kiểm tra:

| Nhóm | Nội dung |
|---|---|
| Xác thực | Đăng ký, đăng nhập, email trùng → 409, mật khẩu yếu → 400, sai mật khẩu → 401 |
| Bảo vệ route | Không token → 401, token rác → 401 |
| CRUD | Tạo → 201, đọc → 200, sửa → 200, xoá → 204, xoá lại → 404 |
| Validate | Số tiền âm, ngày tương lai, category sai, query param lạ, id sai định dạng |
| Lọc & phân trang | Theo category, khoảng ngày, tìm kiếm, `limit` vượt trần |
| Thống kê | Tổng đúng, số category đúng, phần trăm được tính, tháng sai → 400 |
| **Cách ly dữ liệu** | **User B không đọc / sửa / xoá được dữ liệu của user A → 404** |
| Bảo mật | NoSQL injection `$ne`, mass assignment `userId`, không liệt kê được email |
| CORS | Origin trong allowlist → OK, origin lạ → 403 |

Kết quả gần nhất: **55/55 đạt**.

Ngoài ra frontend đã được kiểm thử bằng Playwright ở cả hai kích thước màn
hình (1440×950 và 390×844): toàn bộ luồng đăng nhập → lọc → xem chi tiết →
sửa → tạo → xoá chạy đúng, không có lỗi console và không có API nào trả 4xx/5xx
ngoài dự kiến.

---

## 11. Ghi chú kỹ thuật

### 11.1. Vì sao trả 404 mà không phải 403 khi truy cập dữ liệu của người khác?

403 gián tiếp xác nhận *"id này tồn tại, chỉ là không thuộc về bạn"*, cho phép
kẻ tấn công dò xem những id nào đang tồn tại trong hệ thống. Trả 404 khiến hai
trường hợp *"không tồn tại"* và *"không phải của bạn"* trở nên không phân biệt
được từ bên ngoài.

Cách làm: truy vấn theo `{ _id: id, userId: req.user.id }` thay vì chỉ `{ _id: id }`.
Ràng buộc này nằm ở tầng repository, nên không tầng nào ở trên có thể "quên"
kiểm tra quyền sở hữu.

### 11.2. Vì sao dùng `strict()` của Zod?

Ngoài việc validate kiểu, `.strict()` từ chối field lạ. Điều này chặn hai loại
tấn công cùng lúc:

- **Mass assignment**: client gửi thêm `userId` để gán khoản chi cho người khác → 400
- **NoSQL injection**: payload `{"password": {"$ne": null}}` là object, không phải
  string → 400, nên không bao giờ tới được Mongoose

### 11.3. Vì sao dùng tunnel thay vì mở cổng trên VM?

Cách thông thường là mở cổng 80/443 trên firewall, trỏ DNS về IP của VM, rồi tự
xin và gia hạn chứng chỉ TLS. Cách đó có ba vấn đề: VM bị quét cổng liên tục,
phải tự lo chứng chỉ, và cần IP public tĩnh.

Cloudflare Tunnel đảo chiều kết nối — `cloudflared` trong VM mở kết nối **đi ra**
tới Cloudflare, rồi traffic chảy ngược qua đó. Kết quả:

| | Mở cổng trực tiếp | Cloudflare Tunnel |
|---|---|---|
| Cổng vào cần mở trên VM | 80, 443 | **không cần cổng nào** |
| IP public | bắt buộc | không cần |
| Chứng chỉ TLS | tự xin, tự gia hạn | Cloudflare lo |
| Bị quét/tấn công trực tiếp | có | không (VM không có gì để quét) |

Đánh đổi: phụ thuộc Cloudflare làm trung gian, và cần một domain đã đưa vào
Cloudflare.

### 11.4. Vì sao `TRUST_PROXY=2`?

Rate limiter đếm số request theo IP client, mà IP đó đọc từ header
`X-Forwarded-For` do proxy thêm vào. Phải nói cho Express biết chính xác **có
bao nhiêu lớp proxy đáng tin** ở phía trước — ở đây là 2 (`cloudflared` → Nginx).

- Đặt **thấp** hơn thực tế → Express lấy IP của proxy, mọi người dùng bị gộp vào
  cùng một counter → một người spam là tất cả bị chặn.
- Đặt **cao** hơn thực tế → Express tin phần `X-Forwarded-For` do client tự gửi,
  client bơm IP giả để reset counter → rate limit vô dụng.

Đã kiểm chứng: hai client với `X-Forwarded-For` khác nhau có counter độc lập
(một bên còn 10 lượt, bên kia còn 19).

### 11.5. Cấu trúc thư mục

Slide Lec 8 gợi ý nhóm theo *loại* (`controllers/`, `services/`, `models/`).
Dự án này nhóm theo *tính năng* (`modules/auth/`, `modules/expenses/`) — vẫn
đủ 6 tầng phân lớp, nhưng các file của cùng một tính năng nằm cạnh nhau. Sửa
một tính năng chỉ cần mở một thư mục thay vì nhảy qua 5 thư mục.

### 11.6. Giới hạn đã biết

Access token được lưu ở `localStorage`, nên nếu có lỗ hổng XSS thì token có thể
bị đọc. Slide Lec 9 nêu phương án an toàn hơn: access token giữ trong memory +
refresh token đặt trong cookie `HttpOnly` + refresh token rotation.

Dự án chọn phương án đơn giản hơn cho đúng phạm vi bài tập. Đây là đánh đổi có
ý thức, và được bù lại bằng: React tự escape mọi giá trị nội suy, không dùng
`dangerouslySetInnerHTML` ở bất kỳ đâu, và mọi dữ liệu người dùng đều được
validate trước khi lưu.
