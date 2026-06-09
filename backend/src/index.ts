import dotenv from 'dotenv';
// Load environment variables before importing modules that rely on them
dotenv.config();

import app from './app';
import { logger } from './utils/logger';
import { prisma } from './config/db';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Verify database connection
    await prisma.$connect();
    logger.info('Database connection established successfully.');

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT} in ${process.env.NODE_ENV} mode.`);
      logger.info(`API documentation available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    logger.error('Failed to start the server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Handle process-level unhandled exceptions
process.on('unhandledRejection', (err: any) => {
  logger.error('UNHANDLED REJECTION! Shutting down application...');
  logger.error(err);
  process.exit(1);
});

process.on('uncaughtException', (err: any) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down application...');
  logger.error(err);
  process.exit(1);
});

startServer();
