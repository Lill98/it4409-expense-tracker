import { Link, NavLink, Outlet } from 'react-router-dom';

import { Button } from '../shared/ui/Button.jsx';
import { useAuth } from '../features/auth/useAuth.js';

const NAV_LINK_BASE = 'rounded-lg px-3 py-2 text-sm font-medium transition-colors';

function navLinkClasses({ isActive }) {
  return isActive
    ? `${NAV_LINK_BASE} bg-brand-50 text-brand-700`
    : `${NAV_LINK_BASE} text-slate-600 hover:bg-slate-100`;
}

/**
 * Khung chung cho các trang đã đăng nhập: header + vùng nội dung.
 * `<Outlet />` là chỗ React Router render trang con.
 */
export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-slate-900">
            <span
              aria-hidden="true"
              className="grid size-8 place-items-center rounded-lg bg-brand-600 text-sm text-white"
            >
              ₫
            </span>
            <span className="hidden sm:inline">Quản lý chi tiêu</span>
          </Link>

          <nav className="flex items-center gap-1">
            {/* `end` để link "Tổng quan" không active khi đang ở /expenses/new */}
            <NavLink to="/" end className={navLinkClasses}>
              Tổng quan
            </NavLink>
            <NavLink to="/expenses/new" className={navLinkClasses}>
              Thêm mới
            </NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:inline">{user?.name}</span>
            <Button variant="secondary" onClick={logout} className="px-3 py-1.5 text-xs">
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white py-4">
        <p className="text-center text-xs text-slate-500">
          IT4409 — Công nghệ Web và dịch vụ trực tuyến · Trần Tiến Quân 20242149M
        </p>
      </footer>
    </div>
  );
}
