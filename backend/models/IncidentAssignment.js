const mongoose = require('mongoose');

const incidentAssignmentSchema = new mongoose.Schema({

  incident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incident',
    required: [true, 'Incident reference is required']
  },

  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assignee (user) is required']
  },

  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'AssignedBy (user) is required']
  },

  assignedAt: {
    type: Date,
    default: Date.now
  },

  note: {
    type: String,
    trim: true,
    default: ''
  },

  status: {
    type: String,
    enum: ['Active', 'Released'],
    default: 'Active'
  }

}, {
  timestamps: true
});

// Prevent duplicate ACTIVE assignments for the same engineer & incident
incidentAssignmentSchema.index(
  { incident: 1, assignee: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  'IncidentAssignment',
  incidentAssignmentSchema
);