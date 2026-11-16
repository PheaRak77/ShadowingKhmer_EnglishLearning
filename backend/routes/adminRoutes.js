import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get('/overview', AdminController.getDashboardOverview);
router.patch('/users/:id/role', AdminController.updateUserRole);
router.delete('/users/:id', AdminController.deleteUser);
router.delete('/lessons/:id', AdminController.deleteLesson);

export default router;

