import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'hms_super_secret_jwt_key_2026_production_ready';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'hms_super_secret_jwt_refresh_key_2026_production_ready';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
};
