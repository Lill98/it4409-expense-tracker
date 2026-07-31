import { createContext } from 'react';

/**
 * Chỉ chứa đối tượng Context, tách riêng khỏi Provider và hook.
 *
 * Lý do: Fast Refresh của Vite chỉ hoạt động khi một file chỉ export
 * component. Trộn component + context + hook trong một file làm mất
 * hot reload khi sửa file đó.
 */
export const AuthContext = createContext(null);
