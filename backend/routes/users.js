const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const Incident = require('../models/Incident');
const IncidentAssignment = require('../models/IncidentAssignment');
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

/* POST login user. */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Username/Email and password are required' });
    }

    // Find user, select password, and populate role
    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: email }
      ]
    }).select('+password').populate('role');

    if (!user) {
      res.json({
        message: 'Invalid credentials',
        statusCode: 201
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.json({
        message: 'Invalid credentials',
        statusCode: 201
      });
    }

    res.json({
      message: 'Logged in successfully',
      statusCode: 200,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: {
          _id: user.role._id,
          name: user.role.name,
          permissions: user.role.permissions
        },
        token: generateToken(user)
      }
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

/* GET all engineers (Admin only). */
router.get(
  '/engineers',
  authenticateJWT,
  authorizeRoles('admin'),
  async (req, res, next) => {

    try {

      // Engineer Role
      const engineerRole = await Role.findOne({
        name: 'engineer'
      });

      if (!engineerRole) {
        return res.status(404).json({
          message: 'Engineer role not found'
        });
      }

      const engineers = await User.find({
        role: engineerRole._id
      })
        .populate('role', 'name')
        .select('_id username email role');

      const result = [];

      for (const engineer of engineers) {

        // assignments of this engineer
        const assignments = await IncidentAssignment.find({
          assignee: engineer._id
        }).populate('incident');

        // Count only active incidents
        const activeIncidents = assignments.filter(a => {

          return (
            a.incident &&
            a.incident.status !== 'Resolved' &&
            a.incident.status !== 'Closed'
          );

        }).length;

        result.push({

          _id: engineer._id,

          username: engineer.username,

          email: engineer.email,

          role: engineer.role.name,

          activeIncidents

        });

      }

      result.sort((a, b) =>

        a.activeIncidents - b.activeIncidents

      );

      res.json({

        statusCode: 200,

        message: "Engineers fetched successfully",

        data: result

      });

    } catch (err) {

      next(err);

    }

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

/* GET engineer-only protected resource. */
router.get('/engineer-only', authenticateJWT, authorizeRoles('admin', 'engineer'), (req, res) => {
  res.json({
    message: 'Welcome Engineer/Admin! This resource is restricted to Engineers and Admins.',
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
