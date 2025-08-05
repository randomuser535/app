const mongoose = require('mongoose');

// Product Schema Definition
const productSchema = new mongoose.Schema({
  // Basic product information
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  // Pricing
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  
  // Product identification
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true
  },
  
  // Categorization
  category: {
    type: String,
    required: [true, 'Product category is required'],
    trim: true,
    enum: ['Smartphones', 'Laptops', 'Wearables', 'Headphones', 'Accessories'],
    index: true
  },
  
  brand: {
    type: String,
    required: [true, 'Product brand is required'],
    trim: true,
    maxlength: [100, 'Brand name cannot exceed 100 characters'],
    index: true
  },
  
  // Images
  images: [{
    type: String,
    required: true,
    match: [/^https?:\/\/.+/, 'Please provide a valid image URL']
  }],
  
  // Primary image (first image in the array)
  image: {
    type: String,
    required: [true, 'Primary image is required'],
    match: [/^https?:\/\/.+/, 'Please provide a valid image URL']
  },
  
  // Inventory management
  inventoryCount: {
    type: Number,
    required: [true, 'Inventory count is required'],
    min: [0, 'Inventory count cannot be negative'],
    default: 0
  },
  
  inStock: {
    type: Boolean,
    default: true,
    index: true
  },
  
  // Product ratings and reviews
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  
  reviews: {
    type: Number,
    default: 0,
    min: [0, 'Review count cannot be negative']
  },
  
  // Product status
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // SEO and metadata
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Admin information (optional for simple project)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1, brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isActive: 1, inStock: 1 });

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (!this.isActive) return 'discontinued';
  if (this.inventoryCount === 0) return 'out-of-stock';
  if (this.inventoryCount <= 5) return 'low-stock';
  return 'in-stock';
});

// Pre-save middleware
productSchema.pre('save', function(next) {
  // Set primary image to first image in array
  if (this.images && this.images.length > 0) {
    this.image = this.images[0];
  }
  
  // Update stock status based on inventory
  if (this.inventoryCount <= 0) {
    this.inStock = false;
  }
  
  next();
});

// Static methods for querying
productSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

productSchema.statics.findInStock = function() {
  return this.find({ isActive: true, inStock: true });
};

productSchema.statics.findByCategory = function(category) {
  return this.find({ isActive: true, category });
};

productSchema.statics.findByBrand = function(brand) {
  return this.find({ isActive: true, brand });
};

productSchema.statics.searchProducts = function(query) {
  return this.find({
    isActive: true,
    $text: { $search: query }
  }).sort({ score: { $meta: 'textScore' } });
};

productSchema.statics.getFeatured = function(limit = 10) {
  return this.find({ isActive: true, isFeatured: true })
    .sort({ rating: -1, reviews: -1 })
    .limit(limit);
};

// Instance methods
productSchema.methods.updateStock = function(quantity) {
  this.inventoryCount = Math.max(0, this.inventoryCount + quantity);
  this.inStock = this.inventoryCount > 0;
  return this.save();
};

productSchema.methods.addReview = function(rating) {
  const totalRating = (this.rating * this.reviews) + rating;
  this.reviews += 1;
  this.rating = totalRating / this.reviews;
  return this.save();
};

module.exports = mongoose.model('Product', productSchema);