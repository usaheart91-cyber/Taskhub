const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Survey = require('../models/Survey');
const User = require('../models/User');

// Admin middleware - in production, use proper role-based access
const isAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    // In production, check if user has admin role
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Create survey
router.post('/surveys', isAdmin, async (req, res) => {
  try {
    const { title, description, points, category, questions, estimatedTime } = req.body;

    if (!title || !description || !points) {
      return res.status(400).json({ error: 'Title, description, and points required' });
    }

    const survey = new Survey({
      title,
      description,
      points,
      category: category || 'Other',
      questions: questions || [],
      estimatedTime: estimatedTime || 5,
      createdBy: req.userId
    });

    await survey.save();

    res.status(201).json({
      message: 'Survey created successfully',
      survey
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all surveys (admin)
router.get('/surveys', isAdmin, async (req, res) => {
  try {
    const surveys = await Survey.find()
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 });
    
    res.json(surveys);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update survey
router.put('/surveys/:id', isAdmin, async (req, res) => {
  try {
    const { title, description, points, status } = req.body;

    const survey = await Survey.findByIdAndUpdate(
      req.params.id,
      { title, description, points, status },
      { new: true }
    );

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    res.json({
      message: 'Survey updated successfully',
      survey
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete survey
router.delete('/surveys/:id', isAdmin, async (req, res) => {
  try {
    const survey = await Survey.findByIdAndDelete(req.params.id);

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    res.json({ message: 'Survey deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get analytics
router.get('/analytics', isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSurveys = await Survey.countDocuments();
    const activeSurveys = await Survey.countDocuments({ status: 'active' });
    const totalPoints = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$points' } } }
    ]);

    res.json({
      totalUsers,
      totalSurveys,
      activeSurveys,
      totalPointsDistributed: totalPoints[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
