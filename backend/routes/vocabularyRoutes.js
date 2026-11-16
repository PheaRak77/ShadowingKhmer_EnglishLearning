import { Router } from 'express';
import { VocabularyController } from '../controllers/vocabularyController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, VocabularyController.getUserVocabulary);
router.post('/save', authenticateToken, VocabularyController.saveWord);

export default router;

