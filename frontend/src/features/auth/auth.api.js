import { httpClient } from '../../shared/api/httpClient.js';

/**
 * Tầng gọi API cho auth. Chỗ duy nhất biết đường dẫn endpoint của auth —
 * component không bao giờ tự viết URL.
 */

export async function register({ name, email, password }) {
  const { data } = await httpClient.post('/api/auth/register', { name, email, password });
  return data.data;
}

export async function login({ email, password }) {
  const { data } = await httpClient.post('/api/auth/login', { email, password });
  return data.data;
}

export async function fetchCurrentUser() {
  const { data } = await httpClient.get('/api/auth/me');
  return data.data.user;
}
