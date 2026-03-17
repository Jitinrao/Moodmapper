const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const router = express.Router();

// In-memory fallback storage
const users = new Map();

// Check MongoDB connection status
const isMongoConnected = () => {
  try {
    return mongoose.connection.readyState === 1;
  } catch {
    return false;
  }
};

// Create email transporter
let transporter;
try {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
} catch (error) {
  console.error('Error creating email transporter:', error);
  // Fallback transporter for development
  transporter = {
    sendMail: async (options) => {
      console.log('Email service not configured. Email would be:', options);
      return Promise.resolve();
    }
  };
}

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();

    // Validate input
    if (!normalizedEmail || !password || !name) {
      return res.status(400).json({
        error: 'Email, password, and name are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long'
      });
    }

    let user;
    
    // Try MongoDB first, fallback to in-memory
    if (isMongoConnected()) {
      console.log('📊 Using MongoDB for registration');
      
      // Check if user already exists in MongoDB
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({
          error: 'User with this email already exists'
        });
      }

      // Create new user in MongoDB
      user = new User({
        email: normalizedEmail,
        password, // Will be hashed by pre-save middleware
        name,
        isEmailVerified: true // Auto-verify for development
      });

      await user.save();
      console.log('User registered in MongoDB:', { email: normalizedEmail, name });
    } else {
      console.log('💾 Using in-memory storage for registration');
      
      // Check if user already exists in memory
      if (users.has(normalizedEmail)) {
        return res.status(400).json({
          error: 'User with this email already exists'
        });
      }

      // Hash password for in-memory storage
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user in memory
      const newUser = {
        id: uuidv4(),
        email: normalizedEmail,
        password: hashedPassword,
        name,
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date().toISOString()
      };

      users.set(normalizedEmail, newUser);
      user = newUser;
      console.log('User registered in memory:', { email: normalizedEmail, name });
    }

    res.status(201).json({
      message: 'User registered successfully!',
      user: {
        id: user._id || user.id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive !== false
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed. Please try again.'
    });
  }
});

// Verify email
router.post('/verify-email', async (req, res) => {
  try {
    const { token, email } = req.body;

    if (!token || !email) {
      return res.status(400).json({ error: 'Token and email are required' });
    }

    const storedToken = verificationTokens.get(email);
    if (!storedToken || storedToken !== token) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const user = users.get(email);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    users.set(email, user);

    // Remove verification token
    verificationTokens.delete(email);

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();
    
    console.log('🔐 Login attempt received:', { email: normalizedEmail, passwordProvided: !!password });

    // Validate input
    if (!normalizedEmail || !password) {
      console.log('❌ Validation failed: Missing email or password');
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    let user;
    
    // Try MongoDB first, fallback to in-memory
    if (isMongoConnected()) {
      console.log('📊 Using MongoDB for authentication');
      user = await User.findOne({ email: normalizedEmail });
      console.log('👤 User lookup result:', user ? 'User found' : 'User not found');
      
      if (!user) {
        console.log('❌ Authentication failed: User not found');
        return res.status(401).json({
          error: 'Invalid email or password'
        });
      }

      // Compare password using bcrypt
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('🔑 Password comparison result:', isMatch ? 'Match' : 'No match');
      
      if (!isMatch) {
        console.log('❌ Authentication failed: Invalid password');
        return res.status(401).json({
          error: 'Invalid email or password'
        });
      }
    } else {
      console.log('💾 Using in-memory storage for authentication');
      user = users.get(normalizedEmail);
      
      if (!user) {
        console.log('❌ Authentication failed: User not found in memory');
        return res.status(401).json({
          error: 'Invalid email or password'
        });
      }

      // Compare password using bcrypt
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('🔑 Password comparison result:', isMatch ? 'Match' : 'No match');
      
      if (!isMatch) {
        console.log('❌ Authentication failed: Invalid password');
        return res.status(401).json({
          error: 'Invalid email or password'
        });
      }
    }

    // Check email verification (allow login but warn if not verified)
    if (!user.isEmailVerified) {
      console.log('⚠️  Warning: Email not verified, but allowing login');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id || user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Login successful, generating token');

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id || user.id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified || true,
        isActive: user.isActive !== false // Ensure isActive is included
      }
    });
  } catch (error) {
    console.error('💥 Login error:', error);
    res.status(500).json({
      error: 'Login failed. Please try again.'
    });
  }
});

// Get current user (protected route)
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔐 Token verification request:', { userId: decoded.userId });
    
    // Use MongoDB only - remove in-memory fallback
    console.log('📊 Using MongoDB for user lookup');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive !== false, // Ensure isActive is included
        profile: user.profile,
        stats: user.stats,
        searchHistory: user.searchHistory,
        recentlyViewed: user.recentlyViewed,
        savedPlaces: user.savedPlaces
      }
    });
  } catch (error) {
    console.error('💥 Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Update user profile
router.put('/update-profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { name, email, password } = req.body;

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      user.email = email.toLowerCase();
    }
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    // Return updated user info
    res.json({
      message: 'Profile updated successfully!',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive !== false
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Delete user account
router.delete('/delete-account', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Delete user
    const result = await User.findByIdAndDelete(decoded.userId);
    
    if (!result) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;
