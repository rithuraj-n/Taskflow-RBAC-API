import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.get('/', authenticate as any, authorize(['ADMIN']) as any, UserController.getAllUsers as any);

export default router;
