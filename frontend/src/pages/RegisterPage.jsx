import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../features/auth/useAuth.js';
import { Alert } from '../shared/ui/Feedback.jsx';
import { Button } from '../shared/ui/Button.jsx';
import { TextField } from '../shared/ui/Field.jsx';

const PASSWORD_MIN_LENGTH = 8;

const EMPTY_VALUES = { name: '', email: '', password: '', confirmPassword: '' };

/** Validate client-side; backend vẫn validate lại toàn bộ bằng Zod. */
function validate(values) {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = 'Vui lòng nhập họ tên';
  }

  if (!values.email.trim()) {
    errors.email = 'Vui lòng nhập email';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Email không hợp lệ';
  }

  if (values.password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `Mật khẩu tối thiểu ${PASSWORD_MIN_LENGTH} ký tự`;
  }

  // Trường xác nhận chỉ có ở client — không gửi lên API.
  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Mật khẩu nhập lại không khớp';
  }

  return errors;
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState(EMPTY_VALUES);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    // Xoá lỗi của đúng field đang sửa, để thông báo không đứng lại lâu hơn cần thiết.
    setFieldErrors((previous) => ({ ...previous, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    const errors = validate(values);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ name: values.name, email: values.email, password: values.password });
      navigate('/', { replace: true });
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
          <h1 className="text-2xl font-bold text-slate-900">Tạo tài khoản</h1>
          <p className="mt-1 text-sm text-slate-500">Bắt đầu theo dõi chi tiêu của bạn</p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          {error && <Alert details={error.details}>{error.message}</Alert>}

          <TextField
            id="name"
            name="name"
            label="Họ tên"
            autoComplete="name"
            value={values.name}
            onChange={handleChange}
            error={fieldErrors.name}
            placeholder="Trần Tiến Quân"
          />

          <TextField
            id="email"
            name="email"
            type="email"
            label="Email"
            autoComplete="email"
            value={values.email}
            onChange={handleChange}
            error={fieldErrors.email}
            placeholder="ban@sis.hust.edu.vn"
          />

          <TextField
            id="password"
            name="password"
            type="password"
            label="Mật khẩu"
            autoComplete="new-password"
            value={values.password}
            onChange={handleChange}
            error={fieldErrors.password}
            hint={`Tối thiểu ${PASSWORD_MIN_LENGTH} ký tự`}
            placeholder="••••••••"
          />

          <TextField
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Nhập lại mật khẩu"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={handleChange}
            error={fieldErrors.confirmPassword}
            placeholder="••••••••"
          />

          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Đăng ký
          </Button>

          <p className="text-center text-sm text-slate-600">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-medium text-brand-700 hover:underline">
              Đăng nhập
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
