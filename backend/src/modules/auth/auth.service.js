import bcrypt from 'bcryptjs';

import { env } from '../../config/env.js';
import { ApiError } from '../../shared/ApiError.js';
import * as userRepository from '../users/user.repository.js';
import { signAccessToken } from './token.service.js';

/** Thông báo dùng chung cho mọi trường hợp login thất bại. */
const INVALID_CREDENTIALS = 'Email or password is incorrect';

export async function register({ name, email, password }) {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw ApiError.conflict('Email already registered');
  }

  // bcrypt tự sinh salt và nhúng vào chuỗi hash (Lec 9).
  const passwordHash = await bcrypt.hash(password, env.bcryptRounds);
  const user = await userRepository.createUser({ name, email, passwordHash });

  return { user: user.toJSON(), accessToken: signAccessToken(user) };
}

export async function login({ email, password }) {
  const user = await userRepository.findByEmailWithPassword(email);

  // Email không tồn tại và mật khẩu sai đều trả CÙNG một lỗi, để kẻ tấn công
  // không dùng API này liệt kê được email nào đã đăng ký.
  if (!user) {
    throw ApiError.unauthorized(INVALID_CREDENTIALS);
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    throw ApiError.unauthorized(INVALID_CREDENTIALS);
  }

  return { user: user.toJSON(), accessToken: signAccessToken(user) };
}

/**
 * Đọc lại user từ DB thay vì tin vào payload trong token: nếu tài khoản
 * đã bị xoá thì token cũ phải hết tác dụng ngay.
 */
export async function getCurrentUser(userId) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw ApiError.unauthorized('Account no longer exists');
  }
  return user.toJSON();
}
