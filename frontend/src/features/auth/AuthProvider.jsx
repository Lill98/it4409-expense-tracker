import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  getStoredToken,
  setStoredToken,
  setUnauthorizedHandler,
} from '../../shared/api/httpClient.js';
import { AuthContext } from './auth.context.js';
import * as authApi from './auth.api.js';

/**
 * Trạng thái đăng nhập dùng chung toàn app (Lec 6 - Context API).
 * Dùng Context để tránh prop drilling: mọi component ở bất kỳ độ sâu nào
 * đều đọc được user hiện tại mà không phải truyền props qua từng lớp.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // `isBootstrapping` phân biệt "chưa biết đã đăng nhập chưa" (đang xác thực
  // token trong localStorage) với "đã biết là chưa đăng nhập". Nếu không có
  // cờ này, ProtectedRoute sẽ đá người dùng về /login mỗi lần F5.
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(getStoredToken()));

  const logout = useCallback(() => {
    setStoredToken(null);
    setUser(null);
  }, []);

  // Interceptor gọi hàm này khi API trả 401 (token hết hạn giữa phiên).
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  // Khi tải lại trang: nếu còn token, hỏi server xem token còn hiệu lực không.
  useEffect(() => {
    if (!getStoredToken()) {
      setIsBootstrapping(false);
      return undefined;
    }

    let isActive = true;

    authApi
      .fetchCurrentUser()
      .then((currentUser) => {
        if (isActive) setUser(currentUser);
      })
      .catch(() => {
        // Token hỏng/hết hạn -> dọn sạch, coi như chưa đăng nhập.
        setStoredToken(null);
        if (isActive) setUser(null);
      })
      .finally(() => {
        if (isActive) setIsBootstrapping(false);
      });

    // Cleanup: nếu component unmount trước khi request xong thì không setState
    // nữa, tránh cập nhật state của component đã bị tháo (Lec 6 - cleanup).
    return () => {
      isActive = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const { user: loggedInUser, accessToken } = await authApi.login(credentials);
    setStoredToken(accessToken);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (payload) => {
    const { user: newUser, accessToken } = await authApi.register(payload);
    setStoredToken(accessToken);
    setUser(newUser);
    return newUser;
  }, []);

  // useMemo để consumer không re-render vô ích mỗi lần provider render lại.
  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), isBootstrapping, login, register, logout }),
    [user, isBootstrapping, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
