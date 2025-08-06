const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { validationResult } = require('express-validator');

/**
 * @desc    Get user's wishlist
 * @route   GET /api/wishlist
 * @access  Private (Session-based)
 */
const getWishlist = async (req, res) => {
  try {
    const wishlistItems = await Wishlist.getUserWishlist(req.userId);
    
    // Filter out items where product no longer exists
    const validItems = wishlistItems.filter(item => item.productId);
    
    res.status(200).json({
      success: true,
      count: validItems.length,
      data: {
        wishlist: validItems.map(item => ({
          id: item._id,
          product: item.productId,
          addedAt: item.addedAt,
          priority: item.priority,
          notes: item.notes
        }))
      }
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching wishlist'
    });
  }
};

/**
 * @desc    Add product to wishlist
 * @route   POST /api/wishlist
 * @access  Private (Session-based)
 */
const addToWishlist = async (req, res) => {
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

    const { productId, priority, notes } = req.body;

    // Verify product exists and is active
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or no longer available'
      });
    }

    // Add to wishlist
    const wishlistItem = await Wishlist.addToWishlist(req.userId, productId, {
      priority,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Product added to wishlist',
      data: {
        wishlistItem: {
          id: wishlistItem._id,
          product: wishlistItem.productId,
          addedAt: wishlistItem.addedAt,
          priority: wishlistItem.priority,
          notes: wishlistItem.notes
        }
      }
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    
    if (error.message === 'Product already in wishlist') {
      return res.status(409).json({
        success: false,
        message: 'Product is already in your wishlist'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while adding to wishlist'
    });
  }
};

/**
 * @desc    Remove product from wishlist
 * @route   DELETE /api/wishlist/:productId
 * @access  Private (Session-based)
 */
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const removedItem = await Wishlist.removeFromWishlist(req.userId, productId);

    if (!removedItem) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in wishlist'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing from wishlist'
    });
  }
};

/**
 * @desc    Clear entire wishlist
 * @route   DELETE /api/wishlist
 * @access  Private (Session-based)
 */
const clearWishlist = async (req, res) => {
  try {
    await Wishlist.clearWishlist(req.userId);

    res.status(200).json({
      success: true,
      message: 'Wishlist cleared successfully'
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while clearing wishlist'
    });
  }
};

/**
 * @desc    Get wishlist count
 * @route   GET /api/wishlist/count
 * @access  Private (Session-based)
 */
const getWishlistCount = async (req, res) => {
  try {
    const count = await Wishlist.getWishlistCount(req.userId);

    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Get wishlist count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching wishlist count'
    });
  }
};

/**
 * @desc    Check if product is in wishlist
 * @route   GET /api/wishlist/check/:productId
 * @access  Private (Session-based)
 */
const checkWishlistStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    const isInWishlist = await Wishlist.isInWishlist(req.userId, productId);

    res.status(200).json({
      success: true,
      data: { isInWishlist }
    });
  } catch (error) {
    console.error('Check wishlist status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking wishlist status'
    });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  getWishlistCount,
  checkWishlistStatus
};