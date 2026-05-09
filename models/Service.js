import mongoose from 'mongoose';

const SERVICE_TYPES = ['ambulance', 'fire', 'police'];

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a service name'],
      trim: true,
      maxlength: 100,
      minlength: 2,
    },

    type: {
      type: String,
      required: [true, 'Please add a service type'],
      enum: SERVICE_TYPES,
      lowercase: true,
      trim: true,
    },

    location: {
      lat: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: -90,
        max: 90,
      },
      lng: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: -180,
        max: 180,
      },
    },

    available: {
      type: Boolean,
      default: true,
    },

    currentRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmergencyRequest',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

//
// 🔒 Consistency hook (for .save)
//
serviceSchema.pre('save', function (next) {
  if (this.available === false && !this.currentRequest) {
    return next(new Error('Service must have a request when unavailable'));
  }

  if (this.available === true && this.currentRequest) {
    this.currentRequest = null;
  }

  next();
});

//
// 🔒 Consistency + normalization for findOneAndUpdate
//
serviceSchema.pre('findOneAndUpdate', function (next) {
  const rawUpdate = this.getUpdate();
  if (!rawUpdate) return next();

  // 🔧 Normalize update structure (handles non-operator updates)
  const update = rawUpdate.$set ? rawUpdate : { $set: rawUpdate };
  this.setUpdate(update);

  const set = {
    ...(update.$set || {}),
    ...(update.$setOnInsert || {}),
  };

  const unset = update.$unset || {};

  // 🔧 Normalize fields
  if (typeof set.name === 'string') {
    update.$set.name = set.name.trim();
  }

  if (typeof set.type === 'string') {
    update.$set.type = set.type.trim().toLowerCase();
  }

  let available =
    set.available !== undefined ? set.available : undefined;

  let currentRequest =
    set.currentRequest !== undefined
      ? set.currentRequest
      : unset.currentRequest
      ? null
      : undefined;

  // 🔧 Handle unset (free service)
  if (unset.currentRequest) {
    available = true;
    if (!update.$set) update.$set = {};
    update.$set.available = true;
  }

  // 🔒 Validate ObjectId
  if (
    currentRequest &&
    !mongoose.Types.ObjectId.isValid(currentRequest)
  ) {
    return next(new Error('Invalid currentRequest ObjectId'));
  }

  // 🔧 Infer availability when assigning request
  if (currentRequest && available === undefined) {
    available = false;
    update.$set.available = false;
  }

  // ❌ Prevent invalid state
  if (available === false && !currentRequest) {
    return next(
      new Error('Service must have a request when unavailable')
    );
  }

  // ✅ Auto-clean only if NOT using $unset
  if (available === true && !unset.currentRequest) {
    update.$set.currentRequest = null;
  }

  // 🔧 Ensure validators run
  this.setOptions({ runValidators: true, new: true, context: 'query' });

  next();
});

//
// 📊 Indexes
//
serviceSchema.index({ type: 1, available: 1 });

serviceSchema.index(
  { currentRequest: 1 },
  {
    unique: true,
    partialFilterExpression: { available: false },
  }
);

export default mongoose.model('Service', serviceSchema);