import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  tenantEmail: {
    type: String,
    required: true
  },
  propertyInfo: {
    title: String,
    location: String,
    rent: Number,
    rentType: String,
    propertyType: String,
    bedrooms: Number,
    bathrooms: Number,
    image: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate favorites
favoriteSchema.index({ propertyId: 1, tenantEmail: 1 }, { unique: true });
favoriteSchema.index({ tenantEmail: 1 });

const Favorite = mongoose.model('Favorite', favoriteSchema);

export default Favorite;
