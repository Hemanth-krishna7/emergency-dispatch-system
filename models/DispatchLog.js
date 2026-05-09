import mongoose from 'mongoose';

const dispatchLogSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmergencyRequest',
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null,
    },
    event: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Useful index for querying logs for a specific request
dispatchLogSchema.index({ requestId: 1 });

export default mongoose.model('DispatchLog', dispatchLogSchema);
