import verifyToken from './verifyToken.js';

const verifyTenant = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user?.role !== 'Tenant' && req.user?.role !== 'Admin') {
      return res.status(403).json({ message: 'Tenant access required' });
    }
    next();
  });
};

export default verifyTenant;
