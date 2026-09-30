import type {
  Request,
  Response,
  NextFunction,
} from 'express';

import {
  getRoleCookieName,
  verifyRoleSessionToken,
} from '../services/roleAuthService.js';

export function requireRoleAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.[getRoleCookieName()];

  if (!token || !verifyRoleSessionToken(token)) {
    res.status(401).json({
      error: 'Authentication required',
    });
    return;
  }

  next();
}