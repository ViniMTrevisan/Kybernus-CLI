import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/authenticate';
import * as profileController from './profile.controller';

const router = Router();

router.use(authenticate);

router.get('/', profileController.getProfile);
router.patch('/', profileController.updateProfile);
router.patch('/password', profileController.changePassword);
router.delete('/', profileController.deleteAccount);

export default router;
