const mongoose = require('mongoose');

// Address Schema Definition
const addressSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Address identification
  label: {
    type: String,
    required: [true, 'Address label is required'],
    trim: true,
    maxlength: [50, 'Label cannot exceed 50 characters']
  },
  
  type: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home'
  },
  
  // Recipient information
  name: {
    type: String,
    required: [true, 'Recipient name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please provide a valid phone number']
  },
  
  // Address details
  address: {
    type: String,
    required: [true, 'Street address is required'],
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [100, 'City cannot exceed 100 characters']
  },
  
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    maxlength: [50, 'State cannot exceed 50 characters']
  },
  
  zipCode: {
    type: String,
    required: [true, 'ZIP code is required'],
    trim: true,
    match: [/^\d{5}(-\d{4})?$/, 'Please provide a valid ZIP code']
  },
  
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    default: 'United States',
    maxlength: [100, 'Country cannot exceed 100 characters']
  },
  
  // Address status
  isDefault: {
    type: Boolean,
    default: false
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
addressSchema.index({ userId: 1, isDefault: 1 });
addressSchema.index({ userId: 1, isActive: 1 });

// Virtual for full address
addressSchema.virtual('fullAddress').get(function() {
  return `${this.address}, ${this.city}, ${this.state} ${this.zipCode}, ${this.country}`;
});

// Pre-save middleware to ensure only one default address per user
addressSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    // Remove default status from other addresses for this user
    await this.constructor.updateMany(
      { 
        userId: this.userId, 
        _id: { $ne: this._id },
        isDefault: true 
      },
      { isDefault: false }
    );
  }
  next();
});

// Static method to get user's default address
addressSchema.statics.getDefaultAddress = function(userId) {
  return this.findOne({ userId, isDefault: true, isActive: true });
};

// Static method to get all user addresses
addressSchema.statics.getUserAddresses = function(userId) {
  return this.find({ userId, isActive: true }).sort({ isDefault: -1, createdAt: -1 });
};

// Instance method to set as default
addressSchema.methods.setAsDefault = async function() {
  // Remove default from other addresses
  await this.constructor.updateMany(
    { 
      userId: this.userId, 
      _id: { $ne: this._id },
      isDefault: true 
    },
    { isDefault: false }
  );
  
  // Set this as default
  this.isDefault = true;
  return await this.save();
};

module.exports = mongoose.model('Address', addressSchema);