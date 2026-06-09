import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/customErrors';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Check if headers are already sent
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof AppError) {
    logger.warn(`AppError [${err.statusCode}] - ${err.message} - ${req.originalUrl} - ${req.method}`);
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  // Handle Prisma client error
  if (err.name?.startsWith('PrismaClient')) {
    logger.error(`Prisma Error: ${err.message}`);
    res.status(400).json({
      status: 'error',
      message: 'Database query execution failure',
    });
    return;
  }

  // Log unhandled exceptions
  logger.error(`Unhandled Error: ${err.message}\nStack: ${err.stack}`);
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
};
