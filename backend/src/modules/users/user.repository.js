import { User } from './user.model.js';

/**
 * Tầng truy cập dữ liệu: chỗ duy nhất trong app biết đến Mongoose query API
 * cho collection `users`. Service gọi các hàm này, không tự viết query.
 */

export function findByEmail(email) {
  return User.findOne({ email });
}

/** Dùng khi login: chủ động kéo thêm passwordHash để so sánh bcrypt. */
export function findByEmailWithPassword(email) {
  return User.findOne({ email }).select('+passwordHash');
}

export function findById(id) {
  return User.findById(id);
}

export function createUser({ name, email, passwordHash }) {
  return User.create({ name, email, passwordHash });
}
