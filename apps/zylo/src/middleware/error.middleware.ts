import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/error.handler.js';

const app = express();

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
    });
  }

  console.error(err);
  res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
});
