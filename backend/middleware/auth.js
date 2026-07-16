const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || process.env.SECRET_KEY;
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).populate('role');
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    const userRoleName = req.user.role.name;
    if (!roles.includes(userRoleName)) {
      return res.status(403).json({ message: `Access denied. Role '${userRoleName}' is not authorized to access this resource.` });
    }
    next();
  };
};

const authorizePermissions = (...permissions) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    const userPermissions = req.user.role.permissions || [];
    const hasAllPermissions = permissions.every(p => userPermissions.includes(p));
    if (!hasAllPermissions) {
      return res.status(403).json({
        message: `Access denied. You do not have the required permissions: [${permissions.join(', ')}]`
      });
    }
    next();
  };
};

module.exports = {
  authenticateJWT,
  authorizeRoles,
  authorizePermissions
};
