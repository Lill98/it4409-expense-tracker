import { Router } from 'express';

import { authenticate } from '../../middlewares/authenticate.js';
import { validate } from '../../middlewares/validate.js';
import * as expenseController from './expense.controller.js';
import {
  createExpenseSchema,
  expenseIdParamSchema,
  listExpensesQuerySchema,
  summaryQuerySchema,
  updateExpenseSchema,
} from './expense.validation.js';

const router = Router();

// Toàn bộ route expenses đều yêu cầu đăng nhập — đăng ký một lần ở đây
// thay vì gắn lặp lại trên từng route, để không thể quên.
router.use(authenticate);

// /summary phải khai báo TRƯỚC /:id, nếu không "summary" sẽ bị khớp như một id.
router.get('/summary', validate(summaryQuerySchema, 'query'), expenseController.summary);

router
  .route('/')
  .get(validate(listExpensesQuerySchema, 'query'), expenseController.list)
  .post(validate(createExpenseSchema), expenseController.create);

router
  .route('/:id')
  .all(validate(expenseIdParamSchema, 'params'))
  .get(expenseController.detail)
  .put(validate(updateExpenseSchema), expenseController.replace)
  .delete(expenseController.remove);

export default router;
