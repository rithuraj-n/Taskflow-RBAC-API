import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from '../utils/customErrors';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      // Assign parsed values back to req to ensure sanitization
      if (parsed.body) req.body = parsed.body;
      if (parsed.query) {
        for (const key of Object.keys(req.query)) {
          delete req.query[key];
        }
        Object.assign(req.query, parsed.query);
      }
      if (parsed.params) {
        for (const key of Object.keys(req.params)) {
          delete req.params[key];
        }
        Object.assign(req.params, parsed.params);
      }
      
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorDetails = error.errors.map((err) => {
          const path = err.path.filter(p => p !== 'body' && p !== 'query' && p !== 'params').join('.');
          return `${path || 'field'}: ${err.message}`;
        }).join(', ');
        
        next(new AppError(`Validation error - ${errorDetails}`, 400));
      } else {
        next(error);
      }
    }
  };
};
