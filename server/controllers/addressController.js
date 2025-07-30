const Address = require('../models/Address');
const { validationResult } = require('express-validator');

/**
 * @desc    Get all user addresses
 * @route   GET /api/addresses
 * @access  Private
 */
const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.getUserAddresses(req.user.id);
    
    res.status(200).json({
      success: true,
      count: addresses.length,
      data: { addresses }
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching addresses'
    });
  }
};

/**
 * @desc    Get single address
 * @route   GET /api/addresses/:id
 * @access  Private
 */
const getAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { address }
    });
  } catch (error) {
    console.error('Get address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching address'
    });
  }
};

/**
 * @desc    Create new address
 * @route   POST /api/addresses
 * @access  Private
 */
const createAddress = async (req, res) => {
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

    const { label, type, name, phone, address, city, state, zipCode, country, isDefault } = req.body;

    // Check if this is the user's first address
    const existingAddresses = await Address.find({ userId: req.user.id, isActive: true });
    const shouldBeDefault = isDefault || existingAddresses.length === 0;

    // Create address
    const newAddress = await Address.create({
      userId: req.user.id,
      label,
      type,
      name,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      isDefault: shouldBeDefault
    });

    res.status(201).json({
      success: true,
      message: 'Address created successfully',
      data: { address: newAddress }
    });
  } catch (error) {
    console.error('Create address error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating address'
    });
  }
};

/**
 * @desc    Update address
 * @route   PUT /api/addresses/:id
 * @access  Private
 */
const updateAddress = async (req, res) => {
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

    const address = await Address.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    const { label, type, name, phone, address: streetAddress, city, state, zipCode, country, isDefault } = req.body;

    // Update fields
    address.label = label || address.label;
    address.type = type || address.type;
    address.name = name || address.name;
    address.phone = phone || address.phone;
    address.address = streetAddress || address.address;
    address.city = city || address.city;
    address.state = state || address.state;
    address.zipCode = zipCode || address.zipCode;
    address.country = country || address.country;

    // Handle default status
    if (isDefault !== undefined) {
      address.isDefault = isDefault;
    }

    await address.save();

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: { address }
    });
  } catch (error) {
    console.error('Update address error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating address'
    });
  }
};

/**
 * @desc    Set address as default
 * @route   PUT /api/addresses/:id/default
 * @access  Private
 */
const setDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    await address.setAsDefault();

    res.status(200).json({
      success: true,
      message: 'Default address updated successfully',
      data: { address }
    });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while setting default address'
    });
  }
};

/**
 * @desc    Delete address (soft delete)
 * @route   DELETE /api/addresses/:id
 * @access  Private
 */
const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Check if this is the default address and user has other addresses
    if (address.isDefault) {
      const otherAddresses = await Address.find({
        userId: req.user.id,
        _id: { $ne: address._id },
        isActive: true
      });

      if (otherAddresses.length > 0) {
        // Set the first other address as default
        const newDefault = otherAddresses[0];
        newDefault.isDefault = true;
        await newDefault.save();
      }
    }

    // Soft delete
    address.isActive = false;
    await address.save();

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting address'
    });
  }
};

/**
 * @desc    Get default address
 * @route   GET /api/addresses/default
 * @access  Private
 */
const getDefaultAddress = async (req, res) => {
  try {
    const address = await Address.getDefaultAddress(req.user.id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'No default address found'
      });
    }

    res.status(200).json({
      success: true,
      data: { address }
    });
  } catch (error) {
    console.error('Get default address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching default address'
    });
  }
};

module.exports = {
  getAddresses,
  getAddress,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
  getDefaultAddress
};