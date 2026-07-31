import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AuthProvider } from '../features/auth/AuthProvider.jsx';
import { GuestRoute, ProtectedRoute } from '../features/auth/ProtectedRoute.jsx';
import { AppLayout } from './AppLayout.jsx';
import { DashboardPage } from '../pages/DashboardPage.jsx';
import { ExpenseDetailPage } from '../pages/ExpenseDetailPage.jsx';
import { ExpenseFormPage } from '../pages/ExpenseFormPage.jsx';
import { LoginPage } from '../pages/LoginPage.jsx';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';
import { RegisterPage } from '../pages/RegisterPage.jsx';

/**
 * Bảng route của SPA (Lec 6 - React Router).
 * BrowserRouter đồng bộ UI với thanh địa chỉ mà không reload trang.
 */
export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Đã đăng nhập thì không vào lại được trang đăng nhập/đăng ký. */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Nhóm route yêu cầu đăng nhập, dùng chung layout có header. */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="/expenses/new" element={<ExpenseFormPage />} />
              <Route path="/expenses/:id" element={<ExpenseDetailPage />} />
              <Route path="/expenses/:id/edit" element={<ExpenseFormPage />} />
            </Route>
          </Route>

          {/* /expenses trơ trọi không có trang riêng -> đưa về dashboard. */}
          <Route path="/expenses" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
