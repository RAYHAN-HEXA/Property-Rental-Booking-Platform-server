import express from 'express';
import Property from '../../models/propertyModel.js';
import verifyToken from '../../middlewares/verifyToken.js';
import verifyOwner from '../../middlewares/verifyOwner.js';
import verifyAdmin from '../../middlewares/verifyAdmin.js';

const router = express.Router();

// Create property (Owner only)
router.post('/', verifyOwner, async (req, res) => {
  try {
    const propertyData = {
      ...req.body,
      ownerName: req.user.name,
      ownerEmail: req.user.email,
      ownerPhoto: req.user.photo,
      status: 'Pending'
    };

    const property = new Property(propertyData);
    await property.save();

    res.status(201).json({
      message: 'Property submitted for approval',
      property
    });
  } catch (error) {
    console.error('Property creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get approved properties with search, filter, sort, pagination
router.get('/', async (req, res) => {
  try {
    const {
      search = '',
      propertyType = '',
      minPrice = '',
      maxPrice = '',
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    const query = { status: 'Approved' };

    // Search by location or title
    if (search) {
      query.$or = [
        { location: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by property type
    if (propertyType) {
      query.propertyType = propertyType;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.rent = {};
      if (minPrice) query.rent.$gte = parseFloat(minPrice);
      if (maxPrice) query.rent.$lte = parseFloat(maxPrice);
    }

    // Sort options
    const sortOptions = {};
    const allowedSortFields = ['createdAt', 'rent', 'title', 'location'];

    if (allowedSortFields.includes(sortBy)) {
      sortOptions[sortBy] = order === 'asc' ? 1 : -1;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [properties, total] = await Promise.all([
      Property.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Property.countDocuments(query)
    ]);

    res.json({
      properties,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get featured properties (6 approved properties)
router.get('/featured', async (req, res) => {
  try {
    const properties = await Property.find({ status: 'Approved' })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single property by ID
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).lean();

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get owner's properties
router.get('/owner/:email', verifyToken, async (req, res) => {
  try {
    const properties = await Property.find({ ownerEmail: req.params.email })
      .sort({ createdAt: -1 })
      .lean();

    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update property (Owner only)
router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if user is the owner or admin
    if (property.ownerEmail !== req.user.email && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to update this property' });
    }

    // Don't allow updating status through this endpoint
    const { status, rejectionFeedback, ...updateData } = req.body;

    Object.assign(property, updateData);
    await property.save();

    res.json({
      message: 'Property updated successfully',
      property
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete property (Owner only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if user is the owner or admin
    if (property.ownerEmail !== req.user.email && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to delete this property' });
    }

    await Property.findByIdAndDelete(req.params.id);

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve property (Admin only)
router.patch('/approve/:id', verifyAdmin, async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { status: 'Approved', rejectionFeedback: '' },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json({
      message: 'Property approved successfully',
      property
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject property (Admin only)
router.patch('/reject/:id', verifyAdmin, async (req, res) => {
  try {
    const { rejectionFeedback } = req.body;

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Rejected',
        rejectionFeedback: rejectionFeedback || 'Property does not meet our standards'
      },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json({
      message: 'Property rejected',
      property
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
