import { z } from 'zod';

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }).min(1, 'Title cannot be empty').max(100, 'Title cannot exceed 100 characters'),
    description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional().nullable(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).default('PENDING'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
    dueDate: z.string()
      .datetime({ message: 'dueDate must be a valid ISO 8601 datetime string' })
      .optional()
      .nullable()
      .or(z.string().length(0).transform(() => null)) // handle empty string
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title cannot be empty').max(100, 'Title cannot exceed 100 characters').optional(),
    description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional().nullable(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    dueDate: z.string()
      .datetime({ message: 'dueDate must be a valid ISO 8601 datetime string' })
      .optional()
      .nullable()
      .or(z.string().length(0).transform(() => null)) // handle empty string
  }),
});

export const taskIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Task ID format'),
  }),
});

export const taskQuerySchema = z.object({
  query: z.object({
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    search: z.string().optional(),
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional().default('1'),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional().default('10'),
  }),
});
