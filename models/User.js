import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please use a valid email address',
      ],
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Please add a password'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'dispatcher', 'responder'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// Safe response transformation
userSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.passwordHash;
    return ret;
  },
});

export default mongoose.model('User', userSchema);
