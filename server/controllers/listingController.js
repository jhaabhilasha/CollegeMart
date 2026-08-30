const Listing = require('../models/listing');

exports.getListings = async (req, res, next) => {
  try {
    const { category, search, minPrice, maxPrice, ownerId, status, page = 1, limit = 20 } = req.query;
    
    // Build filter object
    const filter = {};
    
    // Filter by status (default to 'active' for public listings)
    // If ownerId is provided (user viewing their own listings), show all statuses unless specified
    if (status) {
      filter.status = status;
    } else if (!ownerId) {
      // Public listings should only show active items
      filter.status = 'active';
    }
    
    // Filter by category
    if (category) {
      filter.category = category;
    }
    
    // Filter by owner
    if (ownerId) {
      filter.ownerId = ownerId;
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    // Search in title and description (case-insensitive)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    const listings = await Listing.find(filter)
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(Number(limit));
    
    // Get total count for pagination info
    const total = await Listing.countDocuments(filter);
    
    res.json({
      listings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    next(err);
  }
};

exports.createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create({ ...req.body, ownerId: req.user.id, ownerName: req.user.name });
    res.status(201).json(listing);
  } catch (err) {
    next(err);
  }
};

exports.updateListing = async (req, res, next) => {
  try {
    // First find the listing to check ownership
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    
    // Check if user owns this listing (allow admin to bypass)
    if (listing.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }
    
    // Now update the listing
    const updatedListing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedListing);
  } catch (err) {
    next(err);
  }
};

exports.deleteListing = async (req, res, next) => {
  try {
    // First find the listing to check ownership
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    
    // Check if user owns this listing (allow admin to bypass)
    if (listing.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }
    
    // Now delete the listing
    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    next(err);
  }
};
