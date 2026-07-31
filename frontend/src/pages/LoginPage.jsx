import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../features/auth/useAuth.js';
import { Alert } from '../shared/ui/Feedback.jsx';
import { Button } from '../shared/ui/Button.jsx';
import { TextField } from '../shared/ui/Field.jsx';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Two-way binding: onChange cập nhật state, value đọc lại từ state (Lec 6).
  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    // Chặn browser reload trang khi submit form (Lec 5).
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(values);
      // Quay lại trang người dùng định vào trước khi bị chặn, mặc định là "/".
      navigate(location.state?.from ?? '/', { replace: true });
    } catch (submitError) {
      setError(submitError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span
            aria-hidden="true"
            className="mx-auto grid size-12 place-items-center rounded-xl bg-brand-600 text-xl font-bold text-white"
          >
            ₫
          </span>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Quản lý chi tiêu</h1>
          <p className="mt-1 text-sm text-slate-500">Đăng nhập để xem chi tiêu của bạn</p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          {error && <Alert details={error.details}>{error.message}</Alert>}

          <TextField
            id="email"
            name="email"
            type="email"
            label="Email"
            autoComplete="email"
            required
            value={values.email}
            onChange={handleChange}
            placeholder="ban@sis.hust.edu.vn"
          />

          <TextField
            id="password"
            name="password"
            type="password"
            label="Mật khẩu"
            autoComplete="current-password"
            required
            value={values.password}
            onChange={handleChange}
            placeholder="••••••••"
          />

          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Đăng nhập
          </Button>

          <p className="text-center text-sm text-slate-600">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-medium text-brand-700 hover:underline">
              Đăng ký
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
