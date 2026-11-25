import User from '../models/User.js';
import { firebaseAuth } from '../config/firebaseAdmin.js';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    let decoded;
    try {
      if (!firebaseAuth) throw new Error('Firebase Admin is not configured');
      decoded = await firebaseAuth.verifyIdToken(token);
    } catch {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }

    try {
      const safeEmail = decoded.email || `${decoded.uid}@firebase.local`;
      req.user = await User.findOneAndUpdate(
        { firebaseUid: decoded.uid },
        {
          $set: {
            email: safeEmail,
            username: decoded.name || decoded.email?.split('@')[0] || decoded.uid,
            lastLoginAt: new Date()
          },
          $setOnInsert: { firebaseUid: decoded.uid, createdAt: new Date() }
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      ).select('-resetTokenHash -verificationTokenHash');
      if (!req.user) return res.status(401).json({ message: 'User not found' });
      return next();
    } catch {
      return res.status(503).json({ message: 'Authentication service temporarily unavailable' });
    }
  }

  return res.status(401).json({ message: 'Not authorized, no token' });
};

export { protect };
