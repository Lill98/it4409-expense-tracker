import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { Spinner } from '../../shared/ui/Feedback.jsx';
import { useAuth } from './useAuth.js';

/**
 * Chặn route cần đăng nhập.
 *
 * Lưu ý: đây chỉ là bảo vệ ở tầng UI cho trải nghiệm tốt hơn. Bảo vệ thật
 * nằm ở backend — ai gọi API mà không có token hợp lệ đều bị 401.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return <Spinner label="Đang kiểm tra đăng nhập…" />;
  }

  if (!isAuthenticated) {
    // Ghi lại trang đang muốn vào để sau khi đăng nhập quay lại đúng chỗ.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

/** Ngược lại: đã đăng nhập rồi thì không cần vào /login, /register nữa. */
export function GuestRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <Spinner label="Đang kiểm tra đăng nhập…" />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
