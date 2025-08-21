import jwt from 'jsonwebtoken';

/**
 * Extracts token from various sources (Authorization header, cookies, or query params)
 * @param {Object} req - Express request object
 * @returns {string|null} - Extracted token or null if not found
 */
function extractToken(req) {
  // Check Authorization header first
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Check cookies
  if (req.cookies?.token) {
    return req.cookies.token;
  }

  // Check query parameters
  if (req.query?.token) {
    return req.query.token;
  }

  return null;
}

/**
 * Middleware to verify JWT and attach user to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const authenticate = (req, res, next) => {
  const token = extractToken(req);
  if (process.env.NODE_ENV === 'development') {
    req.user = { userId: 'U004', role: 'manager' }; // Mock user
    return next();
  }
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required: No token provided' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { 
      userId: decoded.userId, 
      role: String(decoded.role || '').toLowerCase(), 
      username: decoded.username,
      email: decoded.email,
      employeeId: decoded.employeeId
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Session expired. Please log in again.' 
      });
    }
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

/**
 * Middleware factory to authorize specific roles
 * @param {...string} roles - Allowed roles
 * @returns {Function} - Express middleware function
 */
export const authorize = (...roles) => {
  const allowedRoles = new Set(roles.map(r => String(r).toLowerCase()));
  
  return (req, res, next) => {
    console.log('User Role:', req.user.role); // Debug
    console.log('Required Roles:', roles); 
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!allowedRoles.has(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden: Requires one of these roles: ${[...allowedRoles].join(', ')}` 
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is active (not soft-deleted)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const checkUserActive = async (req, res, next) => {
  try {
    // Assuming you have a User model with isActive field
    const user = await User.findById(req.user.userId);
    
    if (!user || !user.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is inactive or deleted' 
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Error checking user status' 
    });
  }
};

/**
 * Middleware to verify email confirmation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const checkEmailVerified = async (req, res, next) => {
  try {
    // Assuming you have a User model with emailVerified field
    const user = await User.findById(req.user.userId);
    
    if (!user.emailVerified) {
      return res.status(403).json({ 
        success: false, 
        message: 'Please verify your email address first' 
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Error checking email verification status' 
    });
  }
};

/**
 * Middleware to check if the user owns the resource or has admin rights
 * @param {string} resourceIdParam - Name of the parameter containing resource ID
 * @param {string} modelName - Name of the Mongoose model
 * @param {string} ownerField - Field in model that contains owner ID
 * @returns {Function} - Express middleware function
 */
export const checkOwnership = (resourceIdParam, modelName, ownerField = 'userId') => {
  return async (req, res, next) => {
    try {
      const Model = require(`../models/${modelName}`);
      const resource = await Model.findById(req.params[resourceIdParam]);
      
      if (!resource) {
        return res.status(404).json({ 
          success: false, 
          message: 'Resource not found' 
        });
      }

      // Allow if user is admin/manager or owns the resource
      if (req.user.role === 'admin' || 
          req.user.role === 'manager' || 
          String(resource[ownerField]) === String(req.user.userId)) {
        return next();
      }

      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to access this resource' 
      });
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Error checking resource ownership' 
      });
    }
  };
};

/**
 * Middleware to validate API key for external services
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or missing API key' 
    });
  }

  next();
};

// Aliases for backward compatibility
export const requireLogin = authenticate;
export const requireRole = authorize;