import { Request, Response } from 'express';
import { Transaction } from '../types'; // Assuming you have a Transaction type defined
import { getTransactionsByTerminalId } from '../repositories/transactions'; // Assuming you have a repository for transactions
import { ZodError } from 'zod';
import { TransactionQuerySchema } from '../schemas/transactions'; // Assuming you have a schema for transaction queries

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const { terminalId } = req.params;
    const parsedQuery = TransactionQuerySchema.parse(req.query);

    const transactions = await getTransactionsByTerminalId(terminalId, parsedQuery);
    res.status(200).json(transactions);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Invalid query parameters', errors: error.errors });
    } else {
      console.error(error);
      res.status(500).json({ message: 'Failed to retrieve transactions', error: (error as Error).message });
    }
  }
};
