# Base image ghim version cụ thể, không dùng `latest` (Lec 10).
# alpine để image nhỏ, giảm bề mặt tấn công.
FROM node:20-alpine

WORKDIR /app

# Copy manifest TRƯỚC source code: layer cache của Docker chỉ bị vô hiệu khi
# dependency đổi, nên sửa code không phải cài lại node_modules (Lec 10).
COPY package*.json ./

# `npm ci` dùng đúng lockfile, `--omit=dev` bỏ devDependencies khỏi image production.
RUN npm ci --omit=dev

COPY src ./src

# Chỉ copy script seed (cần để tạo tài khoản demo trên VM bằng
# `docker compose exec backend npm run seed`). Không copy smoke-test.js và
# dev-with-memory-db.js vì chúng cần devDependency không có trong image này.
COPY scripts/seed.js scripts/seed-data.js ./scripts/

# Chạy bằng user không phải root — nếu container bị chiếm quyền,
# kẻ tấn công không có root trong container.
USER node

ENV NODE_ENV=production
EXPOSE 3001

# Healthcheck để Docker/orchestrator biết container còn sống thật hay không,
# không chỉ là "process chưa chết".
# Dùng 127.0.0.1 thay vì `localhost` để không phụ thuộc vào thứ tự phân giải
# IPv4/IPv6 trong container (xem ghi chú tương tự ở frontend/Dockerfile).
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/health >/dev/null || exit 1

CMD ["node", "src/server.js"]
