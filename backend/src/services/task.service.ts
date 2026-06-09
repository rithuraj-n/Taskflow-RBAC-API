import { prisma } from '../config/db';
import { NotFoundError, ForbiddenError } from '../utils/customErrors';

export class TaskService {
  static async createTask(data: any, userId: string) {
    const { title, description, status, priority, dueDate } = data;
    return await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'PENDING',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        userId,
      },
    });
  }

  static async getTasks(userId: string, userRole: string, filters: any) {
    const { status, priority, search, page = 1, limit = 10 } = filters;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query conditions
    const where: any = {};

    // RBAC: Non-admin can only see their own tasks
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    // Apply status filter
    if (status) {
      where.status = status;
    }

    // Apply priority filter
    if (priority) {
      where.priority = priority;
    }

    // Apply search filter (title or description)
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Fetch count & data in parallel
    const [totalItems, tasks] = await prisma.$transaction([
      prisma.task.count({ where }),
      prisma.task.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    return {
      tasks,
      pagination: {
        totalItems,
        totalPages,
        currentPage: pageNum,
        limit: limitNum,
      },
    };
  }

  static async getTaskById(taskId: string, userId: string, userRole: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // RBAC check: User can only access their own task
    if (userRole !== 'ADMIN' && task.userId !== userId) {
      throw new ForbiddenError('You do not have permission to access this task');
    }

    return task;
  }

  static async updateTask(taskId: string, data: any, userId: string, userRole: string) {
    // Check if task exists and check permissions
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    if (userRole !== 'ADMIN' && task.userId !== userId) {
      throw new ForbiddenError('You do not have permission to update this task');
    }

    const { title, description, status, priority, dueDate } = data;

    // Build update payload
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) {
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    }

    return await prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });
  }

  static async deleteTask(taskId: string, userId: string, userRole: string) {
    // Check if task exists and check permissions
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    if (userRole !== 'ADMIN' && task.userId !== userId) {
      throw new ForbiddenError('You do not have permission to delete this task');
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return { message: 'Task deleted successfully' };
  }
}
