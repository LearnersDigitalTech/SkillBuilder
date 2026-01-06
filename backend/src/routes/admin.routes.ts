import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

router.use(protect);
router.use(restrictTo('ADMIN'));

// Placeholder routes
router.get('/stats', (req, res) => res.json({ message: 'Get admin stats' }));
router.get('/users', (req, res) => res.json({ message: 'Get all users' }));

export default router;
