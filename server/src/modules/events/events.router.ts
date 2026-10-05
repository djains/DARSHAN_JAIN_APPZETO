import { Router } from 'express';
import { EventsController } from './events.controller';

export const eventsRouter = Router();

eventsRouter.get('/', EventsController.list);
eventsRouter.get('/:id', EventsController.getOne);
eventsRouter.get('/:id/seats', EventsController.getSeats);
eventsRouter.post('/', EventsController.create);
eventsRouter.delete('/:id', EventsController.delete);
