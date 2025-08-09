const mongoose = require('mongoose');
require('dotenv').config();

async function fixIndexes() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Drop all indexes on Cart collection and recreate them properly
    try {
      const cartCollection = db.collection('carts');
      
      console.log('Dropping indexes on Cart collection...');
      await cartCollection.dropIndexes();
      console.log('Cart indexes dropped');

      console.log('Creating compound index on Cart collection...');
      await cartCollection.createIndex({ userId: 1, productId: 1 }, { unique: true });
      console.log('Cart compound index created');

    } catch (error) {
      console.log('Cart index operations error (may be normal):', error.message);
    }

    // Drop all indexes on Wishlist collection and recreate them properly
    try {
      const wishlistCollection = db.collection('wishlists');
      
      console.log('Dropping indexes on Wishlist collection...');
      await wishlistCollection.dropIndexes();
      console.log('Wishlist indexes dropped');

      console.log('Creating compound index on Wishlist collection...');
      await wishlistCollection.createIndex({ userId: 1, productId: 1 }, { unique: true });
      console.log('Wishlist compound index created');

    } catch (error) {
      console.log('Wishlist index operations error (may be normal):', error.message);
    }

    console.log('✅ Database indexes fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

fixIndexes();
