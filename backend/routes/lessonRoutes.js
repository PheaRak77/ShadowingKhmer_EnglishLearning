import { Router } from 'express';
import { LessonController } from '../controllers/lessonController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, LessonController.getUserLessons);
router.get('/:id', authenticateToken, LessonController.getLessonDetails);
router.post('/create', authenticateToken, LessonController.createLesson);
router.delete('/:id', authenticateToken, LessonController.deleteUserLesson);

export default router;

