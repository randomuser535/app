const express = require('express');
const { body } = require('express-validator');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary,
  getCartCount,
  moveFromWishlistToCart
} = require('../controllers/cartController');
const { requireAuth } = require('../middleware/session');

const router = express.Router();

/**
 * Validation rules for adding to cart
 */
const addToCartValidation = [
  body('productId')
    .isMongoId()
    .withMessage('Valid product ID is required'),
    
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 99 })
    .withMessage('Quantity must be between 1 and 99'),
    
  body('variant.size')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Size cannot exceed 50 characters'),
    
  body('variant.color')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Color cannot exceed 50 characters'),
    
  body('variant.model')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Model cannot exceed 100 characters')
];

/**
 * Validation rules for updating cart item
 */
const updateCartValidation = [
  body('quantity')
    .isInt({ min: 0, max: 99 })
    .withMessage('Quantity must be between 0 and 99')
];

/**
 * Validation rules for moving from wishlist to cart
 */
const moveFromWishlistValidation = [
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 99 })
    .withMessage('Quantity must be between 1 and 99')
];

// Apply session authentication to all routes
router.use(requireAuth);

// Cart routes
router.get('/', getCart);
router.get('/summary', getCartSummary);
router.get('/count', getCartCount);
router.post('/', addToCartValidation, addToCart);
router.put('/:productId', updateCartValidation, updateCartItem);
router.delete('/:productId', removeFromCart);
router.delete('/', clearCart);
router.post('/from-wishlist/:productId', moveFromWishlistValidation, moveFromWishlistToCart);

module.exports = router;