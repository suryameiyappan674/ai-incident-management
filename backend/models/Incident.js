const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  incidentId: {
    type: String,
    unique: true,
    // Auto-generated before save, e.g. INC-0001
  },
  title: {
    type: String,
    required: [true, 'Incident title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  priority: {
    type: String,
    enum: {
      values: ['Low', 'Medium', 'High', 'Critical'],
      message: 'Priority must be one of: Low, Medium, High, Critical'
    },
    required: [true, 'Priority is required']
  },
  status: {
    type: String,
    enum: {
      values: ['Open', 'In Progress', 'Resolved', 'Closed'],
      message: 'Status must be one of: Open, In Progress, Resolved, Closed'
    },
    default: 'Open'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator (createdBy) is required']
  }
}, {
  timestamps: true
});

// Auto-generate a human-readable incident ID before saving (only on new docs)
incidentSchema.pre('save', async function () {
  if (!this.isNew) return;

  // Count existing documents to derive the next sequential number
  const count = await mongoose.model('Incident').countDocuments();
  this.incidentId = `INC-${String(count + 1).padStart(4, '0')}`;
});

module.exports = mongoose.model('Incident', incidentSchema);
