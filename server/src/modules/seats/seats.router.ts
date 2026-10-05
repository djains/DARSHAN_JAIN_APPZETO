import { Router } from 'express';
import { SeatsController } from './seats.controller';
import { authenticateToken } from '../../middleware/auth';

export const seatsRouter = Router();

seatsRouter.post('/lock', authenticateToken, SeatsController.lock);
seatsRouter.post('/release', authenticateToken, SeatsController.release);
