import { Router } from 'express';
import {
    getQuestions,
    startQuiz,
    submitQuiz,
    getQuizResult,
    getQuizHistory
} from '../controllers/quiz.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect); // All quiz routes require authentication

router.get('/questions/:grade', getQuestions);
router.post('/start', startQuiz);
router.post('/submit', submitQuiz);
router.get('/results/:id', getQuizResult);
router.get('/history/:childId', getQuizHistory);

export default router;
