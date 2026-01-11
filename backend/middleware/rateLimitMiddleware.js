const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Increased to 10 attempts per 15 minutes
  message: { 
    success: false, 
    message: 'Too many login attempts. Please try again after 15 minutes.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Important for proxies like Render/Vercel
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'unknown';
  },
  skip: (req) => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === 'development';
  }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased to 200 requests per 15 minutes
  message: { 
    success: false, 
    message: 'Too many requests. Please try again later.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'unknown';
  }
});

module.exports = { loginLimiter, apiLimiter };