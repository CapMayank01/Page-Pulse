import { Router } from 'express';
import { getHistory, getAuditById, deleteAudit } from '../controllers/history.controller';
import { requireAuth } from '../middleware/authGuard';

const router = Router();

router.use(requireAuth);

router.get('/', getHistory);
router.get('/:id', getAuditById);
router.delete('/:id', deleteAudit);

export default router;
