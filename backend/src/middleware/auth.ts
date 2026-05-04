import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    username: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
    req.userId = decoded.userId;
    req.user = { id: decoded.userId, username: decoded.username };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const generateToken = (userId: string, username: string): string => {
  return jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '7d' });
};