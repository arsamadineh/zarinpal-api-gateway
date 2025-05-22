import { Request, Response } from 'express';
import { z } from 'zod';
import { AccountSchema } from '../schemas/accounts';
import { handleError } from '../utils/errors';

export const getAccount = async (req: Request, res: Response) => {
  try {
    // TODO: Implement database query to fetch account details
    // const account = await Account.findById(req.params.id);

    // Simulate account data for now
    const account = {
      id: req.params.id,
      accountNumber: '1234567890',
      balance: 1000,
      currency: 'USD',
    };

    const validatedAccount = AccountSchema.parse(account);

    if (!validatedAccount) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.status(200).json(validatedAccount);
  } catch (error) {
    handleError(error, res);
  }
};

export const createAccount = async (req: Request, res: Response) => {
  try {
    const accountData = req.body;

    const validatedAccount = AccountSchema.parse(accountData);

    // TODO: Implement database query to create a new account
    // const newAccount = await Account.create(validatedAccount);

    // Simulate account creation
    const newAccount = {
      id: 'new-account-id',
      ...validatedAccount,
    };

    res.status(201).json(newAccount);
  } catch (error) {
    handleError(error, res);
  }
};
