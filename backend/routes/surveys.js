const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Survey = require('../models/Survey');
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

// Get all surveys
router.get('/', async (req, res) => {
  try {
    const surveys = await Survey.find({ status: 'active' })
      .select('-questions')
      .sort({ createdAt: -1 });
    
    res.json(surveys);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single survey
router.get('/:id', async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    
    res.json(survey);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complete survey
router.post('/:id/complete', verifyToken, async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const user = await User.findById(req.userId);
    
    // Check if already completed
    const alreadyCompleted = user.completedSurveys.some(
      s => s.surveyId.toString() === req.params.id
    );

    if (alreadyCompleted) {
      return res.status(400).json({ error: 'Survey already completed' });
    }

    // Add points
    user.points += survey.points;
    user.completedSurveys.push({
      surveyId: survey._id,
      completedAt: new Date(),
      pointsEarned: survey.points
    });

    await user.save();

    // Update survey stats
    survey.totalParticipants += 1;
    await survey.save();

    res.json({
      message: 'Survey completed successfully',
      pointsEarned: survey.points,
      totalPoints: user.points
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
