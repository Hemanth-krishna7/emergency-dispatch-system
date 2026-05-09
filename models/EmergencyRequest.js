import mongoose from 'mongoose';

// 🔹 Constants (centralized enums)
const SERVICE_TYPES = ['ambulance', 'fire', 'police'];
const PRIORITY_LEVELS = ['HIGH', 'MEDIUM', 'LOW'];
const STATUS_TYPES = [
  'REQUESTED',
  'CLASSIFIED',
  'ASSIGNED',
  'IN_PROGRESS',
  'COMPLETED',
];

const emergencyRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true, // 🔒 cannot be changed after creation
    },

    description: {
      type: String,
      required: [true, 'Please provide an emergency description'],
      trim: true,
      maxlength: 500,
    },

    // 🌍 GeoJSON location
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true,
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
        validate: {
          validator: function (value) {
            return (
              Array.isArray(value) &&
              value.length === 2 &&
              typeof value[0] === 'number' &&
              typeof value[1] === 'number' &&
              value[0] >= -180 &&
              value[0] <= 180 &&
              value[1] >= -90 &&
              value[1] <= 90
            );
          },
          message: 'Coordinates must be [lng, lat] within valid ranges',
        },
      },
      address: {
        type: String,
        trim: true,
      },
    },

    serviceType: {
      type: String,
      enum: SERVICE_TYPES,
      default: null,
    },

    priority: {
      type: String,
      enum: PRIORITY_LEVELS,
      default: 'MEDIUM',
    },

    status: {
      type: String,
      enum: STATUS_TYPES,
      default: 'REQUESTED',
    },

    assignedService: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null,
    },

    // 🔁 Retry counter for allocation engine
    retryCount: {
      type: Number,
      default: 0,
    },

    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

//
// 🔒 VALIDATION + LIFECYCLE HOOK
//
emergencyRequestSchema.pre('save', function (next) {
  // Normalize description
  if (this.description) {
    this.description = this.description.trim();
  }

  // Validate ASSIGNED state
  if (this.status === 'ASSIGNED' && !this.assignedService) {
    return next(
      new Error('assignedService is required when status is ASSIGNED')
    );
  }

  // Validate CLASSIFIED state
  if (this.status === 'CLASSIFIED' && !this.serviceType) {
    return next(
      new Error('serviceType is required when status is CLASSIFIED')
    );
  }

  // Prevent status change after completion
  if (
    this.isModified('status') &&
    this.status !== 'COMPLETED' &&
    this.completedAt
  ) {
    return next(new Error('Cannot change status after completion'));
  }

  // Auto-set completion timestamp
  if (this.status === 'COMPLETED' && !this.completedAt) {
    this.completedAt = new Date();
  }

  next();
});

//
// 📊 INDEXES
//
emergencyRequestSchema.index({ status: 1, createdAt: -1 });
emergencyRequestSchema.index({ location: '2dsphere' });
emergencyRequestSchema.index({ serviceType: 1, status: 1 });
emergencyRequestSchema.index({ userId: 1, createdAt: -1 });
emergencyRequestSchema.index({ assignedService: 1, status: 1 });

export default mongoose.model('EmergencyRequest', emergencyRequestSchema);