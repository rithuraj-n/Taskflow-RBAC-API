import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import v1Routes from './routes/v1';
import { setupSwagger } from './config/swagger';
import { errorHandler } from './middlewares/errorHandler';
import { NotFoundError } from './utils/customErrors';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({
  origin: '*', // In production, replace with specific frontend domains
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

// Log HTTP requests in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Swagger UI mount
setupSwagger(app);

// Mount API version 1 routes
app.use('/api/v1', v1Routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Catch all unregistered routes
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

// Error handling middleware
app.use(errorHandler);

export default app;
