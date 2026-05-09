import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization || req.headers.Authorization;

  // Accept token from header or cookies
  if (authHeader && /^Bearer\s+/i.test(authHeader)) {
    const parts = authHeader.trim().split(/\s+/);
    token = parts.length === 2 ? parts[1] : null;
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET missing');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    req.token = token;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id)
      .select('-passwordHash')
      .lean();

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = {
      ...user,
      role: user.role || decoded.role,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please login again' });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }

    console.error('Auth error:', error.message);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Admin access only' });
};

export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) return next();
    return res.status(403).json({ message: 'Access denied' });
  };
};