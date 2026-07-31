import { HTTP_STATUS } from '../../constants/httpStatus.js';
import { asyncHandler } from '../../shared/asyncHandler.js';
import { sendSuccess } from '../../shared/apiResponse.js';
import * as expenseService from './expense.service.js';

/**
 * Controller mỏng. `req.user.id` do middleware authenticate gắn vào — controller
 * không bao giờ đọc userId từ body hay params.
 */

export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await expenseService.listExpenses(req.user.id, req.validatedQuery);
  return sendSuccess(res, HTTP_STATUS.OK, items, meta);
});

export const detail = asyncHandler(async (req, res) => {
  const expense = await expenseService.getExpenseById(req.params.id, req.user.id);
  return sendSuccess(res, HTTP_STATUS.OK, expense);
});

export const create = asyncHandler(async (req, res) => {
  const expense = await expenseService.createExpense(req.user.id, req.body);
  return sendSuccess(res, HTTP_STATUS.CREATED, expense);
});

export const replace = asyncHandler(async (req, res) => {
  const expense = await expenseService.replaceExpense(req.params.id, req.user.id, req.body);
  return sendSuccess(res, HTTP_STATUS.OK, expense);
});

export const remove = asyncHandler(async (req, res) => {
  await expenseService.deleteExpense(req.params.id, req.user.id);
  // 204: xoá thành công, không có body (Lec 7).
  return res.status(HTTP_STATUS.NO_CONTENT).send();
});

export const summary = asyncHandler(async (req, res) => {
  const result = await expenseService.getMonthlySummary(req.user.id, req.validatedQuery);
  return sendSuccess(res, HTTP_STATUS.OK, result);
});
