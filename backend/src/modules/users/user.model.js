import mongoose from 'mongoose';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MAX_LENGTH = 60;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [NAME_MAX_LENGTH, `Name must be at most ${NAME_MAX_LENGTH} characters`],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_PATTERN, 'Email is not valid'],
    },
    // Chỉ lưu hash bcrypt. Không bao giờ lưu mật khẩu gốc.
    passwordHash: {
      type: String,
      required: true,
      // `select: false` để mọi truy vấn mặc định KHÔNG kéo hash ra khỏi DB;
      // muốn lấy phải chủ động `.select('+passwordHash')`.
      select: false,
    },
  },
  {
    timestamps: true,
    // Chặn NoSQL injection ở tầng schema: field lạ bị từ chối thẳng
    // thay vì bị bỏ qua im lặng (Lec 9 - strict: 'throw').
    strict: 'throw',
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
  },
);

export const User = mongoose.model('User', userSchema);
