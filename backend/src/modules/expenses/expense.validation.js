import { z } from 'zod';

import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from '../../constants/pagination.js';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../../constants/expenseCategories.js';

const MIN_AMOUNT = 1;
const NOTE_MAX_LENGTH = 200;
const TITLE_MAX_LENGTH = 120;
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * Ngày phải parse được và không ở tương lai — không ai ghi lại một khoản
 * chi chưa xảy ra. Đây là một trong các case validate để demo khi vấn đáp.
 */
const dateSchema = z
  .string({ required_error: 'Date is required' })
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Date is not a valid date')
  .refine((value) => new Date(value) <= new Date(), 'Date cannot be in the future');

const amountSchema = z
  .number({
    required_error: 'Amount is required',
    invalid_type_error: 'Amount must be a number',
  })
  .int('Amount must be a whole number (VND)')
  .min(MIN_AMOUNT, `Amount must be at least ${MIN_AMOUNT}`);

const titleSchema = z
  .string({ required_error: 'Title is required' })
  .trim()
  .min(1, 'Title is required')
  .max(TITLE_MAX_LENGTH, `Title must be at most ${TITLE_MAX_LENGTH} characters`);

const noteSchema = z
  .string()
  .trim()
  .max(NOTE_MAX_LENGTH, `Note must be at most ${NOTE_MAX_LENGTH} characters`);

/**
 * Không có `userId` trong schema, và `.strict()` từ chối field lạ — nên client
 * không thể tự gán khoản chi cho user khác. userId chỉ đến từ JWT.
 */
export const createExpenseSchema = z
  .object({
    title: titleSchema,
    amount: amountSchema,
    category: z.enum(EXPENSE_CATEGORIES, {
      errorMap: () => ({ message: `Category must be one of: ${EXPENSE_CATEGORIES.join(', ')}` }),
    }),
    paymentMethod: z
      .enum(PAYMENT_METHODS, {
        errorMap: () => ({ message: `Payment method must be one of: ${PAYMENT_METHODS.join(', ')}` }),
      })
      .optional(),
    date: dateSchema,
    note: noteSchema.optional(),
  })
  .strict();

/** PUT thay thế toàn bộ resource nên dùng cùng bộ trường bắt buộc như POST. */
export const updateExpenseSchema = createExpenseSchema;

export const listExpensesQuerySchema = z
  .object({
    category: z.enum(EXPENSE_CATEGORIES).optional(),
    from: z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), '"from" is not a valid date')
      .optional(),
    to: z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), '"to" is not a valid date')
      .optional(),
    search: z.string().trim().max(TITLE_MAX_LENGTH).optional(),
    // Query param luôn là string, nên phải coerce sang number.
    page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
    limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
    sort: z.enum(['date', '-date', 'amount', '-amount']).default('-date'),
  })
  .strict()
  .refine(
    (query) => !query.from || !query.to || new Date(query.from) <= new Date(query.to),
    { message: '"from" must be before or equal to "to"', path: ['from'] },
  );

export const summaryQuerySchema = z
  .object({
    month: z
      .string()
      .regex(MONTH_PATTERN, 'Month must be in YYYY-MM format')
      .optional(),
  })
  .strict();

export const expenseIdParamSchema = z
  .object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid expense id'),
  })
  .strict();
