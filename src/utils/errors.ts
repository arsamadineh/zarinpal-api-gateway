import { Response } from 'express';
import { ZodError } from 'zod';

export const handleError = (error: any, res: Response) => {
  console.error(error);

  if (error instanceof ZodError) {
    return res.status(400).json({ message: 'Validation error', errors: error.errors });
  }

  if (error instanceof Error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }

  return res.status(500).json({ message: 'Internal server error' });
};
