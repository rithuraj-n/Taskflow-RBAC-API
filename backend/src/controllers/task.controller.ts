import { Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { AuthenticatedRequest } from '../middlewares/auth';

export class TaskController {
  static async createTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const task = await TaskService.createTask(req.body, userId);
      res.status(201).json({
        status: 'success',
        message: 'Task created successfully',
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTasks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const result = await TaskService.getTasks(userId, userRole, req.query);
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTaskById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = req.params.id as string;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const task = await TaskService.getTaskById(taskId, userId, userRole);
      res.status(200).json({
        status: 'success',
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = req.params.id as string;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const task = await TaskService.updateTask(taskId, req.body, userId, userRole);
      res.status(200).json({
        status: 'success',
        message: 'Task updated successfully',
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = req.params.id as string;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const result = await TaskService.deleteTask(taskId, userId, userRole);
      res.status(200).json({
        status: 'success',
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}
