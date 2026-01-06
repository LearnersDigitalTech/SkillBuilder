import { Router } from 'express';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

// Placeholder routes - will be implemented
router.get('/', (req, res) => res.json({ message: 'Get all students' }));
router.get('/:id', (req, res) => res.json({ message: 'Get student details' }));
router.post('/', (req, res) => res.json({ message: 'Create student' }));
router.put('/:id', (req, res) => res.json({ message: 'Update student' }));
router.delete('/:id', (req, res) => res.json({ message: 'Delete student' }));

export default router;
