import axios from 'axios';

const TIMEOUT_MS = 15000;
const TOKEN_STORAGE_KEY = 'it4409.accessToken';
const UNAUTHORIZED = 401;

/**
 * Axios instance dùng chung (Lec 7 - Axios Instance).
 * Trong dev, baseURL để rỗng và Vite proxy /api sang backend.
 * Khi deploy, đặt VITE_API_BASE_URL trỏ tới domain của backend.
 */
export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  timeout: TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

export function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

/**
 * Request interceptor: tự gắn Bearer token vào mọi request.
 * Nhờ vậy không tầng nào khác phải nhớ gắn header Authorization.
 */
httpClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Đăng ký callback để AuthContext biết khi token hết hạn mà đăng xuất.
 * Dùng cách này thay vì import trực tiếp AuthContext để tránh phụ thuộc vòng.
 */
let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

/**
 * Response interceptor: chuẩn hoá mọi lỗi thành một Error có `message`
 * đọc được và `details` cho lỗi validate — để component chỉ cần đọc
 * `error.message` là hiển thị được (Lec 7 - Response Interceptor).
 */
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Token hết hạn hoặc không hợp lệ -> đăng xuất, trừ khi đây chính là
      // request đăng nhập (khi đó 401 nghĩa là sai mật khẩu).
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (status === UNAUTHORIZED && !isLoginRequest && onUnauthorized) {
        onUnauthorized();
      }

      const normalized = new Error(data?.message ?? 'Đã có lỗi xảy ra');
      normalized.status = status;
      normalized.details = data?.errors;
      return Promise.reject(normalized);
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Yêu cầu quá thời gian chờ, vui lòng thử lại'));
    }

    return Promise.reject(new Error('Không kết nối được tới server'));
  },
);
