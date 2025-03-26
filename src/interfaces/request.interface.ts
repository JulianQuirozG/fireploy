import { Request } from 'express';

export interface RequestWithUser extends Request {
  user?: { id: number };  // O cambia `id` por `createdUser` si prefieres
}
