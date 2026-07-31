import { HTTP_STATUS } from '../../constants/httpStatus.js';
import { asyncHandler } from '../../shared/asyncHandler.js';
import { sendSuccess } from '../../shared/apiResponse.js';
import * as authService from './auth.service.js';

/**
 * Controller mỏng: chỉ nhận request đã được validate, gọi service,
 * rồi chọn status code. Không chứa nghiệp vụ, không truy vấn DB.
 */

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return sendSuccess(res, HTTP_STATUS.CREATED, result);
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return sendSuccess(res, HTTP_STATUS.OK, result);
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);
  return sendSuccess(res, HTTP_STATUS.OK, { user });
});
