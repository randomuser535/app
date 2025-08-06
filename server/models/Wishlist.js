const mongoose = require('mongoose');

/**
 * Wishlist Schema
 * Stores user's saved products for later purchase
 */
const wishlistSchema = new mongoose.Schema({
  // User identification (using session-based auth)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Product reference
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  
  // When item was added to wishlist
  addedAt: {
    type: Date,
    default: Date.now
  },
  
  // Optional: Priority or notes
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    trim: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate wishlist items
wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Static methods for wishlist operations
wishlistSchema.statics.getUserWishlist = function(userId) {
  return this.find({ userId })
    .populate('productId')
    .sort({ addedAt: -1 });
};

wishlistSchema.statics.addToWishlist = async function(userId, productId, options = {}) {
  try {
    const wishlistItem = await this.create({
      userId,
      productId,
      ...options
    });
    
    return await this.findById(wishlistItem._id).populate('productId');
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('Product already in wishlist');
    }
    throw error;
  }
};

wishlistSchema.statics.removeFromWishlist = function(userId, productId) {
  return this.findOneAndDelete({ userId, productId });
};

wishlistSchema.statics.clearWishlist = function(userId) {
  return this.deleteMany({ userId });
};

wishlistSchema.statics.getWishlistCount = function(userId) {
  return this.countDocuments({ userId });
};

wishlistSchema.statics.isInWishlist = async function(userId, productId) {
  const item = await this.findOne({ userId, productId });
  return !!item;
};

module.exports = mongoose.model('Wishlist', wishlistSchema);