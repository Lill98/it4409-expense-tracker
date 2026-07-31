import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <p className="text-5xl font-bold text-brand-600">404</p>
        <h1 className="mt-3 text-xl font-bold text-slate-900">Không tìm thấy trang</h1>
        <p className="mt-1 text-sm text-slate-500">
          Đường dẫn bạn truy cập không tồn tại hoặc đã bị đổi.
        </p>
        <Link
          to="/"
          className="mt-5 inline-block rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
