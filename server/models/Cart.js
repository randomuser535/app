const mongoose = require('mongoose');

/**
 * Cart Schema
 * Stores user's shopping cart items with quantities
 */
const cartSchema = new mongoose.Schema({
  // User identification (using session-based auth)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Product reference
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  
  // Quantity of this product in cart
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    max: [99, 'Quantity cannot exceed 99']
  },
  
  // Price at time of adding to cart (for price change tracking)
  priceAtAdd: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  
  // When item was added to cart
  addedAt: {
    type: Date,
    default: Date.now
  },
  
  // Optional: Size, color, or other variant information
  variant: {
    size: String,
    color: String,
    model: String
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate cart items
cartSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Virtual for total price of this cart item
cartSchema.virtual('totalPrice').get(function() {
  return this.quantity * this.priceAtAdd;
});

// Static methods for cart operations
cartSchema.statics.getUserCart = function(userId) {
  return this.find({ userId })
    .populate('productId')
    .sort({ addedAt: -1 });
};

cartSchema.statics.addToCart = async function(userId, productId, quantity = 1, priceAtAdd) {
  try {
    // Check if item already exists in cart
    const existingItem = await this.findOne({ userId, productId });
    
    if (existingItem) {
      // Update quantity if item exists
      existingItem.quantity += quantity;
      
      // Ensure quantity doesn't exceed maximum
      if (existingItem.quantity > 99) {
        existingItem.quantity = 99;
      }
      
      return await existingItem.save();
    } else {
      // Create new cart item
      const cartItem = await this.create({
        userId,
        productId,
        quantity,
        priceAtAdd
      });
      
      return await this.findById(cartItem._id).populate('productId');
    }
  } catch (error) {
    throw error;
  }
};

cartSchema.statics.updateCartItem = async function(userId, productId, quantity) {
  if (quantity <= 0) {
    return this.removeFromCart(userId, productId);
  }
  
  const cartItem = await this.findOne({ userId, productId });
  
  if (!cartItem) {
    throw new Error('Cart item not found');
  }
  
  cartItem.quantity = Math.min(quantity, 99); // Ensure max quantity
  return await cartItem.save();
};

cartSchema.statics.removeFromCart = function(userId, productId) {
  return this.findOneAndDelete({ userId, productId });
};

cartSchema.statics.clearCart = function(userId) {
  return this.deleteMany({ userId });
};

cartSchema.statics.getCartTotal = async function(userId) {
  const cartItems = await this.find({ userId }).populate('productId');
  
  return cartItems.reduce((total, item) => {
    // Use current product price if available, fallback to priceAtAdd
    const price = item.productId?.price || item.priceAtAdd;
    return total + (price * item.quantity);
  }, 0);
};

cartSchema.statics.getCartCount = function(userId) {
  return this.countDocuments({ userId });
};

cartSchema.statics.getCartItemsCount = async function(userId) {
  const cartItems = await this.find({ userId });
  return cartItems.reduce((count, item) => count + item.quantity, 0);
};

module.exports = mongoose.model('Cart', cartSchema);