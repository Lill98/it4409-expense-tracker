import mongoose from 'mongoose';

import {
  DEFAULT_PAYMENT_METHOD,
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
} from '../../constants/expenseCategories.js';

const MIN_AMOUNT = 1;
const NOTE_MAX_LENGTH = 200;
const TITLE_MAX_LENGTH = 120;

const expenseSchema = new mongoose.Schema(
  {
    // Đề bài: "Dữ liệu phải gắn với userId, mỗi user chỉ thấy dữ liệu của chính mình".
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [TITLE_MAX_LENGTH, `Title must be at most ${TITLE_MAX_LENGTH} characters`],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [MIN_AMOUNT, `Amount must be at least ${MIN_AMOUNT}`],
    },
    // Trường phân loại/lọc bắt buộc của đề bài.
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: EXPENSE_CATEGORIES,
        message: 'Category "{VALUE}" is not supported',
      },
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: {
        values: PAYMENT_METHODS,
        message: 'Payment method "{VALUE}" is not supported',
      },
      default: DEFAULT_PAYMENT_METHOD,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    note: {
      type: String,
      trim: true,
      default: '',
      maxlength: [NOTE_MAX_LENGTH, `Note must be at most ${NOTE_MAX_LENGTH} characters`],
    },
  },
  {
    timestamps: true,
    strict: 'throw',
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Index ghép phục vụ truy vấn thực tế: "chi tiêu của user X, mới nhất trước".
// userId đứng đầu vì mọi truy vấn đều bắt đầu bằng nó.
expenseSchema.index({ userId: 1, date: -1 });

export const Expense = mongoose.model('Expense', expenseSchema);
