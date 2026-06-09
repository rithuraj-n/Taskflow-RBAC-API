import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createTaskSchema, updateTaskSchema, taskIdSchema, taskQuerySchema } from '../validation/task.schema';

const router = Router();

// Secure all task routes
router.use(authenticate as any);

router.post('/', validate(createTaskSchema), TaskController.createTask as any);
router.get('/', validate(taskQuerySchema), TaskController.getTasks as any);
router.get('/:id', validate(taskIdSchema), TaskController.getTaskById as any);
router.put('/:id', validate(taskIdSchema.merge(updateTaskSchema)), TaskController.updateTask as any);
router.delete('/:id', validate(taskIdSchema), TaskController.deleteTask as any);

export default router;
