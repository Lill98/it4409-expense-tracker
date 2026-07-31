# Multi-stage build (Lec 10): stage build tạo file tĩnh, stage run chỉ chứa
# Nginx + file tĩnh. Image cuối không có Node, không có source code,
# không có node_modules — nhỏ hơn và an toàn hơn nhiều.

# ---------- Build stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Vite nhúng biến môi trường vào bundle lúc BUILD, không phải lúc chạy.
# Vì vậy URL của backend phải truyền vào ở đây qua build arg.
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ---------- Run stage ----------
FROM nginx:1.27-alpine

# Cấu hình reverse proxy + xử lý routing của SPA.
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Dùng 127.0.0.1 chứ KHÔNG dùng `localhost`: trong container, `localhost`
# phân giải ::1 (IPv6) trước, nhưng `listen 80` của Nginx chỉ nghe IPv4 nên
# healthcheck sẽ luôn "connection refused" → container mãi unhealthy →
# cloudflared (depends_on: service_healthy) không bao giờ start được.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
