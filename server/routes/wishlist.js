const express = require('express');
const { body } = require('express-validator');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  getWishlistCount,
  checkWishlistStatus
} = require('../controllers/wishlistController');
const { requireAuth } = require('../middleware/session');

const router = express.Router();

/**
 * Validation rules for adding to wishlist
 */
const addToWishlistValidation = [
  body('productId')
    .isMongoId()
    .withMessage('Valid product ID is required'),
    
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
    
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

// Apply session authentication to all routes
router.use(requireAuth);

// Wishlist routes
router.get('/', getWishlist);
router.get('/count', getWishlistCount);
router.get('/check/:productId', checkWishlistStatus);
router.post('/', addToWishlistValidation, addToWishlist);
router.delete('/:productId', removeFromWishlist);
router.delete('/', clearWishlist);

module.exports = router;