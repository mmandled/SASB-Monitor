import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const COOKIE_NAME = 'sasb_role_session';

const SESSION_DURATION_SECONDS = 60 * 60 * 8; // 8 hours

function getPasswordHash(): string {
  const hash = process.env.SASB_ROLE_PASSWORD_HASH;

  if (!hash) {
    throw new Error('SASB_ROLE_PASSWORD_HASH is not configured');
  }

  return hash;
}

function getSessionSecret(): string {
  const secret = process.env.SASB_ROLE_SESSION_SECRET;

  if (!secret) {
    throw new Error('SASB_ROLE_SESSION_SECRET is not configured');
  }

  return secret;
}

export async function verifyRolePassword(
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, getPasswordHash());
}

export function createRoleSessionToken(): string {
  return jwt.sign(
    {
      purpose: 'sasb-role-admin',
    },
    getSessionSecret(),
    {
      expiresIn: SESSION_DURATION_SECONDS,
    },
  );
}

export function verifyRoleSessionToken(token: string): boolean {
  try {
    const payload = jwt.verify(token, getSessionSecret());

    return (
      typeof payload === 'object' &&
      payload !== null &&
      payload.purpose === 'sasb-role-admin'
    );
  } catch {
    return false;
  }
}

export function getRoleCookieName(): string {
  return COOKIE_NAME;
}

export function getRoleCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: SESSION_DURATION_SECONDS * 1000,
    path: '/',
  };
}