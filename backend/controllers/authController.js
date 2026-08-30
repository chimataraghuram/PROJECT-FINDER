export const getCurrentUser = async (req, res) => {
  res.json({ _id: req.user._id, firebaseUid: req.user.firebaseUid, username: req.user.username, email: req.user.email, photoURL: req.user.photoURL, emailVerified: req.user.emailVerified, createdAt: req.user.createdAt, lastLoginAt: req.user.lastLoginAt });
};
