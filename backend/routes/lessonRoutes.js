import { Router } from 'express';
import { LessonController } from '../controllers/lessonController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Public "All Lessons" library routes (visible to new users, guests, and students)
router.get('/library', LessonController.getPublicLibrary);
router.get('/public/:id', LessonController.getPublicLessonDetails);

// Authenticated student & admin routes
router.get('/', authenticateToken, LessonController.getUserLessons);
router.get('/history', authenticateToken, LessonController.getStudyHistory);
router.post('/create', authenticateToken, LessonController.createLesson);
router.post('/:id/study', authenticateToken, LessonController.recordStudyProgress);
router.get('/:id', authenticateToken, LessonController.getLessonDetails);
router.delete('/:id', authenticateToken, LessonController.deleteUserLesson);

export default router;

