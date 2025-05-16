import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  googleId?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: function(this: IUser) {
      return !this.googleId; // Password is required only if not using Google auth
    },
    select: false, // Don't include password in queries by default
  },
  name: {
    type: String,
    required: true,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allow null/undefined values
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  try {
    if (!this.isModified('password') || !this.password) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    if (!this.password) return false;
    
    // Log for debugging
    console.log('Comparing passwords...');
    console.log('Candidate password length:', candidatePassword.length);
    console.log('Stored password length:', this.password.length);
    
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Password match result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

export const User = mongoose.model<IUser>('User', userSchema); 