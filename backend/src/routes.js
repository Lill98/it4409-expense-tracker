import { Router } from 'express';

import authRoutes from './modules/auth/auth.routes.js';
import expenseRoutes from './modules/expenses/expense.routes.js';

/**
 * Điểm gắn kết duy nhất của mọi route. Thêm module mới thì thêm một dòng ở đây.
 */
const router = Router();

router.use('/auth', authRoutes);
router.use('/expenses', expenseRoutes);

export default router;
