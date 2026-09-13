import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { DataStore } from '../services/dataStore.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fundbridge-super-secret-jwt-key-2026-prod';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'supporter' | 'creator' | 'admin';
    credits: number;
    photoUrl?: string;
  };
}

export function generateToken(payload: { id: string; email: string; role: string; name: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string; name: string };

    const user = await DataStore.findUserByEmail(decoded.email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User session invalid or user deleted.' });
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      credits: user.credits,
      photoUrl: user.photoUrl,
    };

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
}

export function requireSupporter(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }
  if (req.user.role !== 'supporter' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden. Supporter role required.' });
  }
  next();
}

export function requireCreator(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }
  if (req.user.role !== 'creator' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden. Creator role required.' });
  }
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden. Administrator access required.' });
  }
  next();
}
