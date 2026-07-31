import { z } from 'zod';

const PASSWORD_MIN_LENGTH = 8;
const NAME_MAX_LENGTH = 60;

/**
 * `z.string()` là lớp phòng thủ NoSQL injection: payload `{"$ne": null}`
 * là object nên bị loại ngay tại đây, không bao giờ tới được Mongoose.
 * `.strict()` loại bỏ field lạ, chặn mass assignment.
 */
const emailSchema = z
  .string({ required_error: 'Email is required' })
  .trim()
  .toLowerCase()
  .email('Email is not valid');

const passwordSchema = z
  .string({ required_error: 'Password is required' })
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`);

export const registerSchema = z
  .object({
    name: z
      .string({ required_error: 'Name is required' })
      .trim()
      .min(1, 'Name is required')
      .max(NAME_MAX_LENGTH, `Name must be at most ${NAME_MAX_LENGTH} characters`),
    email: emailSchema,
    password: passwordSchema,
  })
  .strict();

export const loginSchema = z
  .object({
    email: emailSchema,
    // Không áp min length khi login: mật khẩu sai độ dài vẫn phải trả 401
    // chứ không phải 400, tránh tiết lộ luật mật khẩu cho kẻ dò.
    password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
  })
  .strict();
