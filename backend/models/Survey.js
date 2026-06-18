const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    required: true,
    min: 1
  },
  category: {
    type: String,
    enum: ['Technology', 'Health', 'Lifestyle', 'Finance', 'Entertainment', 'Other'],
    default: 'Other'
  },
  questions: [{
    question: String,
    type: {
      type: String,
      enum: ['text', 'multiple-choice', 'rating', 'yes-no']
    },
    options: [String],
    required: Boolean
  }],
  estimatedTime: {
    type: Number, // in minutes
    default: 5
  },
  totalParticipants: {
    type: Number,
    default: 0
  },
  maxParticipants: {
    type: Number,
    default: 1000
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Survey', surveySchema);
