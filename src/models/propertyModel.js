import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  propertyType: {
    type: String,
    enum: ['Apartment', 'House', 'Condo', 'Studio', 'Villa', 'Townhouse', 'Office', 'Other'],
    required: true
  },
  rent: {
    type: Number,
    required: true,
    min: 0
  },
  rentType: {
    type: String,
    enum: ['Monthly', 'Weekly', 'Daily'],
    default: 'Monthly'
  },
  bedrooms: {
    type: Number,
    required: true,
    min: 0
  },
  bathrooms: {
    type: Number,
    required: true,
    min: 0
  },
  propertySize: {
    type: Number,
    required: true,
    min: 0
  },
  amenities: [{
    type: String
  }],
  images: [{
    type: String
  }],
  extraFeatures: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  rejectionFeedback: {
    type: String,
    default: ''
  },
  ownerName: {
    type: String,
    required: true
  },
  ownerEmail: {
    type: String,
    required: true
  },
  ownerPhoto: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
propertySchema.index({ status: 1, createdAt: -1 });
propertySchema.index({ location: 'text', title: 'text' });
propertySchema.index({ ownerEmail: 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ rent: 1 });

const Property = mongoose.model('Property', propertySchema);

export default Property;
