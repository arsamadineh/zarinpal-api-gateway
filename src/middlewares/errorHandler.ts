import { ErrorRequestHandler } from 'express';
import { HttpError } from '../utils/errors/HttpError';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ message: err.message, errors: err.errors });
  }

  // Zarinpal specific error handling can be added here based on their error codes

  res.status(500).json({ message: 'Internal Server Error' });
};
