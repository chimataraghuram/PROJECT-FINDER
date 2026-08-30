import User from '../models/User.js';
import { firebaseAuth } from '../config/firebaseAdmin.js';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (!firebaseAuth) throw new Error('Firebase Admin is not configured');
      const decoded = await firebaseAuth.verifyIdToken(token);
      req.user = await User.findOneAndUpdate({ firebaseUid: decoded.uid }, { $set: { email: decoded.email, username: decoded.name || decoded.email?.split('@')[0] || decoded.uid, lastLoginAt: new Date() }, $setOnInsert: { firebaseUid: decoded.uid, createdAt: new Date() } }, { new: true, upsert: true, setDefaultsOnInsert: true }).select('-resetTokenHash -verificationTokenHash');
      if (!req.user) throw new Error('User not found');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export { protect };
