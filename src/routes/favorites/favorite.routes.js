import express from 'express';
import Property from '../../models/propertyModel.js';
import Favorite from '../../models/favoriteModel.js';
import verifyToken from '../../middlewares/verifyToken.js';
import verifyTenant from '../../middlewares/verifyTenant.js';

const router = express.Router();

// Add to favorites (Tenant only)
router.post('/', verifyTenant, async (req, res) => {
  try {
    const { propertyId } = req.body;

    if (!propertyId) {
      return res.status(400).json({ message: 'Property ID is required' });
    }

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      propertyId,
      tenantEmail: req.user.email
    });

    if (existingFavorite) {
      return res.status(400).json({ message: 'Property already in favorites' });
    }

    const favorite = new Favorite({
      propertyId,
      tenantEmail: req.user.email,
      propertyInfo: {
        title: property.title,
        location: property.location,
        rent: property.rent,
        rentType: property.rentType,
        propertyType: property.propertyType,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        image: property.images?.[0] || ''
      }
    });

    await favorite.save();

    res.status(201).json({
      message: 'Added to favorites',
      favorite
    });
  } catch (error) {
    console.error('Favorite creation error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Property already in favorites' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's favorites
router.get('/:email', verifyToken, async (req, res) => {
  try {
    const favorites = await Favorite.find({ tenantEmail: req.params.email })
      .sort({ createdAt: -1 })
      .lean();

    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove favorite
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const favorite = await Favorite.findById(req.params.id);

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    // Check if favorite belongs to user
    if (favorite.tenantEmail !== req.user.email && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to remove this favorite' });
    }

    await Favorite.findByIdAndDelete(req.params.id);

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
