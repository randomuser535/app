const express = require('express');
const { body } = require('express-validator');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStock,
  getCategories,
  getBrands,
  getFeaturedProducts,
  updateInventory
} = require('../controllers/productController');

const router = express.Router();

/**
 * Validation rules for product creation
 */
const productValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Product name must be between 1 and 200 characters'),
    
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
    
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
    
  body('sku')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('SKU is required and cannot exceed 50 characters')
    .matches(/^[A-Za-z0-9\-_]+$/)
    .withMessage('SKU can only contain letters, numbers, hyphens, and underscores'),
    
  body('category')
    .isIn(['Smartphones', 'Laptops', 'Wearables', 'Headphones', 'Accessories'])
    .withMessage('Invalid category'),
    
  body('brand')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Brand name is required and cannot exceed 100 characters'),
    
  body('inventoryCount')
    .isInt({ min: 0 })
    .withMessage('Inventory count must be a non-negative integer'),
    
  body('inStock')
    .isBoolean()
    .withMessage('inStock must be a boolean value'),
    
  body('images')
    .isArray({ min: 1 })
    .withMessage('At least one image is required'),
    
  body('images.*')
    .isURL()
    .withMessage('All images must be valid URLs'),
    
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean value')
];

/**
 * Validation rules for product update (all fields optional)
 */
const productUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Product name must be between 1 and 200 characters'),
    
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
    
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
    
  body('sku')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('SKU cannot exceed 50 characters')
    .matches(/^[A-Z0-9-_]+$/)
    .withMessage('SKU can only contain uppercase letters, numbers, hyphens, and underscores'),
    
  body('category')
    .optional()
    .isIn(['Smartphones', 'Laptops', 'Wearables', 'Headphones', 'Accessories'])
    .withMessage('Invalid category'),
    
  body('brand')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Brand name cannot exceed 100 characters'),
    
  body('inventoryCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Inventory count must be a non-negative integer'),
    
  body('inStock')
    .optional()
    .isBoolean()
    .withMessage('inStock must be a boolean value'),
    
  body('images')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one image is required'),
    
  body('images.*')
    .optional()
    .isURL()
    .withMessage('All images must be valid URLs'),
    
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean value')
];

/**
 * Validation for stock toggle
 */
const stockToggleValidation = [
  body('inStock')
    .isBoolean()
    .withMessage('inStock must be a boolean value')
];

/**
 * Validation for inventory update
 */
const inventoryUpdateValidation = [
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
    
  body('operation')
    .optional()
    .isIn(['set', 'add', 'subtract'])
    .withMessage('Operation must be set, add, or subtract')
];

// Public routes
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/brands', getBrands);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProduct);

// Product management routes (no authentication required for simple project)
router.post('/', productValidation, createProduct);
router.put('/:id', productUpdateValidation, updateProduct);
router.delete('/:id', deleteProduct);
router.patch('/:id/stock', stockToggleValidation, toggleProductStock);
router.patch('/:id/inventory', inventoryUpdateValidation, updateInventory);

module.exports = router;