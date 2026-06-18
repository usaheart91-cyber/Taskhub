const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await User.find({ isActive: true })
      .select('username points joinedAt')
      .sort({ points: -1 })
      .limit(100);
    
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('username points completedSurveys completedTasks joinedAt');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      username: user.username,
      points: user.points,
      surveysCompleted: user.completedSurveys.length,
      tasksCompleted: user.completedTasks.length,
      joinedAt: user.joinedAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/:id/profile', verifyToken, async (req, res) => {
  try {
    if (req.userId !== req.params.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { username } = req.body;
    
    if (username) {
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: req.params.id } 
      });
      
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard data
router.get('/:id/dashboard', verifyToken, async (req, res) => {
  try {
    if (req.userId !== req.params.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(req.params.id);
    
    res.json({
      username: user.username,
      points: user.points,
      surveysCompleted: user.completedSurveys.length,
      tasksCompleted: user.completedTasks.length,
      joinedAt: user.joinedAt,
      referralPoints: user.referralPoints,
      referralCode: user.referralCode
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
