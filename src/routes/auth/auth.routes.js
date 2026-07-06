import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../../models/userModel.js';
import verifyToken from '../../middlewares/verifyToken.js';
import verifyAdmin from '../../middlewares/verifyAdmin.js';

const router = express.Router();

// Helper: Generate JWT token
function generateToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  return jwt.sign(
    {
      email: user.email,
      role: user.role,
      name: user.name,
      photo: user.photo
    },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// Helper: Format user response
function formatUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    photo: user.photo,
    role: user.role,
    phone: user.phone || '',
    provider: user.provider || 'credentials'
  };
}

// POST /register - User registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, photo, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Validate role
    const validRoles = ['Tenant', 'Owner', 'Admin'];
    const userRole = role && validRoles.includes(role) ? role : 'Tenant';

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      photo: photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      role: userRole,
      provider: 'credentials'
    });

    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: formatUser(newUser)
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
});

// POST /login - Email/password login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user with password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user has password (Google-only users won't have one)
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'Please sign in with Google or reset your password'
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: formatUser(user)
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login'
    });
  }
});

// POST /auth/sync-user - Sync user after Better Auth OAuth
router.post('/sync-user', async (req, res) => {
  try {
    const { name, email, photo, provider, role } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find existing user
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // User exists - return existing user without changing role
      const token = generateToken(user);

      return res.json({
        success: true,
        message: 'User synced successfully',
        token,
        user: formatUser(user)
      });
    }

    // New user - create with default Tenant role for Google/social login
    const newUser = new User({
      name: name?.trim() || 'User',
      email: email.toLowerCase(),
      photo: photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      role: 'Tenant', // Always default to Tenant for new Google users
      provider: provider || 'google'
      // No password for OAuth users
    });

    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser);

    res.json({
      success: true,
      message: 'User created and synced successfully',
      token,
      user: formatUser(newUser)
    });
  } catch (error) {
    console.error('Sync User Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during user sync'
    });
  }
});

// POST /jwt - Legacy endpoint (kept for compatibility)
router.post('/', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name: req.body.name || 'User',
        email,
        photo: req.body.photo || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
        role: 'Tenant'
      });
      await user.save();
    }

    const token = generateToken(user);

    res.json({
      token,
      user: formatUser(user)
    });
  } catch (error) {
    console.error('JWT Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (Admin only)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password -createdAt -updatedAt').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by email
router.get('/:email', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(formatUser(user));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile by email
router.patch('/:email', verifyToken, async (req, res) => {
  try {
    const { name, photo, phone, address } = req.body;
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (photo !== undefined) user.photo = photo;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;

    await user.save();
    res.json({ success: true, data: formatUser(user) });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role (Admin only)
router.patch('/role/:id', verifyAdmin, async (req, res) => {
  try {
    const { role } = req.body;

    if (!['Tenant', 'Owner', 'Admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Role updated successfully',
      user: formatUser(user)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
