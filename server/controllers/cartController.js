const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { validationResult } = require('express-validator');

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private (Session-based)
 */
const getCart = async (req, res) => {
  try {
    const cartItems = await Cart.getUserCart(req.userId);
    
    // Filter out items where product no longer exists
    const validItems = cartItems.filter(item => item.productId);
    
    // Calculate totals
    const subtotal = validItems.reduce((total, item) => {
      const price = item.productId?.price || item.priceAtAdd;
      return total + (price * item.quantity);
    }, 0);
    
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 100 ? 0 : 9.99; // Free shipping over $100
    const total = subtotal + tax + shipping;

    res.status(200).json({
      success: true,
      count: validItems.length,
      data: {
        cart: validItems.map(item => ({
          id: item._id,
          product: item.productId,
          quantity: item.quantity,
          priceAtAdd: item.priceAtAdd,
          totalPrice: item.quantity * (item.productId?.price || item.priceAtAdd),
          addedAt: item.addedAt,
          variant: item.variant
        })),
        summary: {
          subtotal: parseFloat(subtotal.toFixed(2)),
          tax: parseFloat(tax.toFixed(2)),
          shipping: parseFloat(shipping.toFixed(2)),
          total: parseFloat(total.toFixed(2)),
          itemCount: validItems.reduce((count, item) => count + item.quantity, 0)
        }
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cart'
    });
  }
};

/**
 * @desc    Add product to cart
 * @route   POST /api/cart
 * @access  Private (Session-based)
 */
const addToCart = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.path,
          message: error.msg,
          value: error.value
        }))
      });
    }

    const { productId, quantity = 1, variant } = req.body;

    // Verify product exists and is active
    const product = await Product.findOne({ _id: productId, isActive: true });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or no longer available'
      });
    }

    // Check if product is in stock
    if (!product.inStock) {
      return res.status(400).json({
        success: false,
        message: 'Product is currently out of stock'
      });
    }

    // Check inventory if available
    if (product.inventoryCount !== undefined && product.inventoryCount < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.inventoryCount} items available in stock`
      });
    }

    // Add to cart
    const cartItem = await Cart.addToCart(req.userId, productId, quantity, product.price);

    res.status(201).json({
      success: true,
      message: 'Product added to cart',
      data: {
        cartItem: {
          id: cartItem._id,
          product: cartItem.productId,
          quantity: cartItem.quantity,
          priceAtAdd: cartItem.priceAtAdd,
          totalPrice: cartItem.quantity * cartItem.priceAtAdd,
          addedAt: cartItem.addedAt,
          variant: cartItem.variant
        }
      }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding to cart'
    });
  }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/:productId
 * @access  Private (Session-based)
 */
const updateCartItem = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.path,
          message: error.msg,
          value: error.value
        }))
      });
    }

    const { productId } = req.params;
    const { quantity } = req.body;

    // If quantity is 0 or less, remove item
    if (quantity <= 0) {
      const removedItem = await Cart.removeFromCart(req.userId, productId);
      
      if (!removedItem) {
        return res.status(404).json({
          success: false,
          message: 'Cart item not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Item removed from cart'
      });
    }

    // Update quantity
    const updatedItem = await Cart.updateCartItem(req.userId, productId, quantity);

    res.status(200).json({
      success: true,
      message: 'Cart item updated',
      data: {
        cartItem: {
          id: updatedItem._id,
          product: updatedItem.productId,
          quantity: updatedItem.quantity,
          priceAtAdd: updatedItem.priceAtAdd,
          totalPrice: updatedItem.quantity * updatedItem.priceAtAdd,
          addedAt: updatedItem.addedAt,
          variant: updatedItem.variant
        }
      }
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    
    if (error.message === 'Cart item not found') {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating cart item'
    });
  }
};

/**
 * @desc    Remove product from cart
 * @route   DELETE /api/cart/:productId
 * @access  Private (Session-based)
 */
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const removedItem = await Cart.removeFromCart(req.userId, productId);

    if (!removedItem) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product removed from cart'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing from cart'
    });
  }
};

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart
 * @access  Private (Session-based)
 */
const clearCart = async (req, res) => {
  try {
    await Cart.clearCart(req.userId);

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while clearing cart'
    });
  }
};

/**
 * @desc    Get cart summary (totals and counts)
 * @route   GET /api/cart/summary
 * @access  Private (Session-based)
 */
const getCartSummary = async (req, res) => {
  try {
    const cartItems = await Cart.getUserCart(req.userId);
    
    const subtotal = cartItems.reduce((total, item) => {
      const price = item.productId?.price || item.priceAtAdd;
      return total + (price * item.quantity);
    }, 0);
    
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 100 ? 0 : 9.99; // Free shipping over $100
    const total = subtotal + tax + shipping;
    const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          subtotal: parseFloat(subtotal.toFixed(2)),
          tax: parseFloat(tax.toFixed(2)),
          shipping: parseFloat(shipping.toFixed(2)),
          total: parseFloat(total.toFixed(2)),
          itemCount,
          cartCount: cartItems.length
        }
      }
    });
  } catch (error) {
    console.error('Get cart summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cart summary'
    });
  }
};

/**
 * @desc    Get cart count (number of unique items)
 * @route   GET /api/cart/count
 * @access  Private (Session-based)
 */
const getCartCount = async (req, res) => {
  try {
    const count = await Cart.getCartCount(req.userId);
    const itemsCount = await Cart.getCartItemsCount(req.userId);

    res.status(200).json({
      success: true,
      data: { 
        count, // Unique products
        itemsCount // Total quantity
      }
    });
  } catch (error) {
    console.error('Get cart count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cart count'
    });
  }
};

/**
 * @desc    Move item from wishlist to cart
 * @route   POST /api/cart/from-wishlist/:productId
 * @access  Private (Session-based)
 */
const moveFromWishlistToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity = 1 } = req.body;

    // Verify product exists and is active
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or no longer available'
      });
    }

    // Check if product is in stock
    if (!product.inStock) {
      return res.status(400).json({
        success: false,
        message: 'Product is currently out of stock'
      });
    }

    // Add to cart
    const cartItem = await Cart.addToCart(req.userId, productId, quantity, product.price);

    // Remove from wishlist
    await Wishlist.removeFromWishlist(req.userId, productId);

    res.status(200).json({
      success: true,
      message: 'Product moved from wishlist to cart',
      data: {
        cartItem: {
          id: cartItem._id,
          product: cartItem.productId,
          quantity: cartItem.quantity,
          priceAtAdd: cartItem.priceAtAdd,
          totalPrice: cartItem.quantity * cartItem.priceAtAdd,
          addedAt: cartItem.addedAt
        }
      }
    });
  } catch (error) {
    console.error('Move from wishlist to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while moving item to cart'
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary,
  getCartCount,
  moveFromWishlistToCart
};