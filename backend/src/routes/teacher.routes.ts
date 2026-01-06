import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

router.use(protect);
router.use(restrictTo('TEACHER', 'ADMIN'));

// Placeholder routes
router.get('/', (req, res) => res.json({ message: 'Get all teachers' }));
router.get('/:id', (req, res) => res.json({ message: 'Get teacher details' }));

export default router;
