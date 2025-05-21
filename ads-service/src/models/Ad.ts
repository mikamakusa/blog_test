import mongoose from 'mongoose';

export interface IAd {
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  position: string;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

const adSchema = new mongoose.Schema<IAd>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  targetUrl: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  position: { type: String, required: true },
  priority: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Ad = mongoose.model<IAd>('Ad', adSchema); 