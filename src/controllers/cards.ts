import { Request, Response } from 'express';
import { z } from 'zod';
import { CardSchema } from '../schemas/cards';
import { handleError } from '../utils/errors';

export const getCard = async (req: Request, res: Response) => {
  try {
    // TODO: Implement database query to fetch card details
    // const card = await Card.findById(req.params.id);

    // Simulate card data for now
    const card = {
      id: req.params.id,
      cardNumber: '1234567890123456',
      expiryDate: '12/24',
      cvv: '123',
    };

    const validatedCard = CardSchema.parse(card);

    if (!validatedCard) {
      return res.status(404).json({ message: 'Card not found' });
    }

    res.status(200).json(validatedCard);
  } catch (error) {
    handleError(error, res);
  }
};

export const createCard = async (req: Request, res: Response) => {
  try {
    const cardData = req.body;

    const validatedCard = CardSchema.parse(cardData);

    // TODO: Implement database query to create a new card
    // const newCard = await Card.create(validatedCard);

    // Simulate card creation
    const newCard = {
      id: 'new-card-id',
      ...validatedCard,
    };

    res.status(201).json(newCard);
  } catch (error) {
    handleError(error, res);
  }
};
