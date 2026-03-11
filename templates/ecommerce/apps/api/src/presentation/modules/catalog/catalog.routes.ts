import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { validateUuidParam } from '../../validators/uuidParam';
import * as catalogController from './catalog.controller';

const router = Router();

// Multer: memory storage, 5 MB limit — MIME validation done in controller
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ── Public routes ─────────────────────────────────────────────────────────────
router.get('/', catalogController.listProducts);
router.get('/:slug', catalogController.getProduct);

// ── Admin-only routes ─────────────────────────────────────────────────────────
router.post('/', authenticate, authorize('ADMIN'), catalogController.createProduct);
router.put('/:id', authenticate, authorize('ADMIN'), validateUuidParam(), catalogController.updateProduct);
router.delete('/:id', authenticate, authorize('ADMIN'), validateUuidParam(), catalogController.deleteProduct);
router.patch('/:id/stock', authenticate, authorize('ADMIN'), validateUuidParam(), catalogController.updateStock);
router.post(
  '/:id/image',
  authenticate,
  authorize('ADMIN'),
  validateUuidParam(),
  imageUpload.single('image'),
  catalogController.uploadProductImage,
);

export default router;

// ── Stand-alone categories router ─────────────────────────────────────────────
export const categoryRouter = Router();
categoryRouter.get('/', catalogController.listCategories);
