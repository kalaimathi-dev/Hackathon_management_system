const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const AuditLog = require('../models/AuditLog');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt');
const { sendVerificationEmail } = require('../utils/emailService');
const { generateToken, getClientIp } = require('../utils/helpers');

const register = async (req, res) => {
  try {
    const { name, email, password, role, skills } = req.body;

    console.log('📝 Registration attempt:', { name, email, role });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ Email already exists:', email);
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    const verificationToken = generateToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = new User({
      name,
      email,
      password,
      role: role || 'participant',
      skills: skills || [],
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires
    });

    await user.save();
    console.log('✅ User saved to database:', user._id, user.email);

    // Send verification email (don't block response if it fails)
    sendVerificationEmail(user, verificationToken).catch(err => {
      console.error('Failed to send verification email:', err);
    });

    await AuditLog.create({
      action: 'user_registered',
      performedBy: user._id,
      ipAddress: getClientIp(req)
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      data: {
        userId: user._id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed: ' + error.message 
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired verification token' 
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully. You can now login.'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Email verification failed' 
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt for:', email);

    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ 
        success: false, 
        message: 'User not found. Please register first.' 
      });
    }

    console.log('✅ User found:', user.email, '| Verified:', user.isEmailVerified);

    if (user.isLocked()) {
      const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({ 
        success: false, 
        message: `Account locked. Try again in ${lockTimeRemaining} minutes.` 
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      console.log('❌ Password mismatch for:', email);
      await user.incrementLoginAttempts();
      return res.status(401).json({ 
        success: false, 
        message: 'Incorrect password' 
      });
    }

    if (!user.isEmailVerified) {
      console.log('⚠️ Email not verified for:', email);
      return res.status(403).json({ 
        success: false, 
        message: 'Please verify your email before logging in' 
      });
    }

    console.log('✅ Login successful for:', email);

    await user.resetLoginAttempts();

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    await AuditLog.create({
      action: 'user_login',
      performedBy: user._id,
      ipAddress: getClientIp(req)
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          skills: user.skills
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed' 
    });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Refresh token required' 
      });
    }

    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid refresh token' 
      });
    }

    const storedToken = await RefreshToken.findOne({ 
      token: refreshToken,
      userId: decoded.userId 
    });

    if (!storedToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'Refresh token not found' 
      });
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const newAccessToken = generateAccessToken(user._id, user.role);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Token refresh failed' 
    });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Logout failed' 
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch profile' 
    });
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  refreshAccessToken,
  logout,
  getProfile
};