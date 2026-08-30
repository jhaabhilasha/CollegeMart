const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  condition: { type: String, enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'], required: true },
  status: { type: String, enum: ['active', 'sold', 'archived'], default: 'active' },
  images: [{ type: String }],
  location: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerName: { type: String },
  ownerImage: { type: String },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes for better query performance
listingSchema.index({ category: 1 }); // Filter by category
listingSchema.index({ ownerId: 1 }); // Filter by owner
listingSchema.index({ createdAt: -1 }); // Sort by newest
listingSchema.index({ price: 1 }); // Filter/sort by price
listingSchema.index({ isFeatured: 1, createdAt: -1 }); // Featured listings query
listingSchema.index({ title: 'text', description: 'text' }); // Text search
listingSchema.index({ status: 1 }); // Filter by status

module.exports = mongoose.model('Listing', listingSchema);
