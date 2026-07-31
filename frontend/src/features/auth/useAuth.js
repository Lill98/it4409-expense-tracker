import { useContext } from 'react';

import { AuthContext } from './auth.context.js';

/** Đọc trạng thái đăng nhập từ bất kỳ component nào trong cây. */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được dùng bên trong <AuthProvider>');
  }
  return context;
}
