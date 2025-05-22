import { Response } from 'express';

export const handleError = (res: Response, statusCode: number, message: string, error?: any) => {
  console.error(error); // Log the error for debugging purposes

  const response = {
    message: message,
  };

  if (process.env.NODE_ENV === 'development' && error) {
    response['error'] = error.message || error; // Include error details in development
  }

  return res.status(statusCode).json(response);
};

export class CustomError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}
