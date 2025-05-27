import { Request } from 'express';

export interface RequestProjectWithUser extends Request {
  user?: { isInProject: boolean };  // O cambia `id` por `createdUser` si prefieres
}
