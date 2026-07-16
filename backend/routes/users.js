const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const { authenticateJWT, authorizeRoles, authorizePermissions } = require('../middleware/auth');

// Generate JWT Helper
const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || process.env.SECRET_KEY;
  const roleName = user.role && user.role.name ? user.role.name : '';
  return jwt.sign(
    { id: user._id, role: roleName },
    secret,
    { expiresIn: '24h' }
  );
};

/* POST register user. */
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'Username or Email is already registered' });
    }

    // Resolve role name to its ObjectId
    const roleName = (role || 'user').toLowerCase();
    const roleDoc = await Role.findOne({ name: roleName });
    if (!roleDoc) {
      return res.status(400).json({ message: `Role '${roleName}' does not exist` });
    }

    // Create user
    const user = new User({
      username,
      email,
      password,
      role: roleDoc._id
    });

    await user.save();
    await user.populate('role');

    // Do not return password in response
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: {
        _id: user.role._id,
        name: user.role.name,
        permissions: user.role.permissions
      },
      createdAt: user.createdAt
    };

    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      token: generateToken(user)
    });
  } catch (error) {
    next(error);
  }
});

/* POST login user. */
router.post('/login', async (req, res, next) => {
  try {
    const { loginIdentifier, password } = req.body;

    if (!loginIdentifier || !password) {
      return res.status(400).json({ message: 'Username/Email and password are required' });
    }

    // Find user, select password, and populate role
    const user = await User.findOne({
      $or: [
        { email: loginIdentifier.toLowerCase() },
        { username: loginIdentifier }
      ]
    }).select('+password').populate('role');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      message: 'Logged in successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: {
          _id: user.role._id,
          name: user.role.name,
          permissions: user.role.permissions
        }
      },
      token: generateToken(user)
    });
  } catch (error) {
    next(error);
  }
});

/* GET current user profile. */
router.get('/me', authenticateJWT, async (req, res) => {
  res.json({
    user: {
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: {
        _id: req.user.role._id,
        name: req.user.role.name,
        permissions: req.user.role.permissions
      },
      createdAt: req.user.createdAt
    }
  });
});

/* GET admin-only protected resource. */
router.get('/admin-only', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  res.json({
    message: 'Welcome Admin! This is a restricted admin-only resource.',
    user: {
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role.name
    }
  });
});

/* GET manager-only protected resource. */
router.get('/manager-only', authenticateJWT, authorizeRoles('admin', 'manager'), (req, res) => {
  res.json({
    message: 'Welcome Manager/Admin! This resource is restricted to Managers and Admins.',
    user: {
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role.name
    }
  });
});

/* GET resource requiring 'manage_users' permission. */
router.get('/manage-users-only', authenticateJWT, authorizePermissions('manage_users'), (req, res) => {
  res.json({
    message: 'Success! You have the required permission (manage_users) to access this.',
    user: {
      _id: req.user._id,
      username: req.user.username,
      role: req.user.role.name,
      permissions: req.user.role.permissions
    }
  });
});

module.exports = router;
