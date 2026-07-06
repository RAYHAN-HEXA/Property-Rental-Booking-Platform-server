import verifyToken from './verifyToken.js';

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user?.role !== 'Admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  });
};

export default verifyAdmin;
