import verifyToken from './verifyToken.js';

const verifyOwner = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user?.role !== 'Owner' && req.user?.role !== 'Admin') {
      return res.status(403).json({ message: 'Owner access required' });
    }
    next();
  });
};

export default verifyOwner;
