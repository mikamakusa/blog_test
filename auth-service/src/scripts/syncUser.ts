import mongoose from 'mongoose';
import { User } from '../models/User';
import { StrapiService } from '../services/strapiService';
import dotenv from 'dotenv';

dotenv.config();

async function syncUser() {
  try {
    const email = 'michael.dangleterre@gmail.com';
    const password = 'Amakusa01+';
    
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://your-mongodb-atlas-uri');
    console.log('Connected to MongoDB');

    // Delete existing user if exists
    await User.deleteOne({ email });
    console.log('Cleaned up any existing user');

    // Create new user with proper password hashing
    const user = new User({
      email,
      password,
      name: 'Michael Dangleterre'
    });

    await user.save();
    console.log('User created successfully in MongoDB');
    console.log('Email:', email);
    console.log('User ID:', user._id);

    // Verify the user was saved correctly
    const savedUser = await User.findOne({ email }).select('+password');
    if (savedUser) {
      console.log('User verification successful');
      console.log('Stored password hash length:', savedUser.password?.length);
    }

  } catch (error) {
    console.error('Error syncing user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

syncUser(); 