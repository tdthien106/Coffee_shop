import User from '../models/userModel.js';

// Validate user data before creation
export const validateUser = async (req, res, next) => {
  const { name, email, username, password } = req.body;

  if (!name || !email || !username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }

  // Check if username already exists
  const existingUser = await User.findByUsername(username);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Username already exists'
    });
  }

  next();
};

// Validate user data before update
export const validateUserUpdate = async (req, res, next) => {
  const { username } = req.body;

  if (username) {
    // Check if new username already exists (excluding current user)
    const existingUser = await User.findByUsername(username);
    if (existingUser && existingUser.userID !== req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }
  }

  next();
};