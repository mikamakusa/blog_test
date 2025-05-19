import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  name: string;
  googleId?: string;
  strapiId?: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  googleId: {
    type: String,
    sparse: true,
  },
  strapiId: {
    type: Number,
    sparse: true,
  },
}, {
  timestamps: true,
});

// Remove sensitive information when converting to JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

export const User = mongoose.model<IUser>('User', userSchema); 