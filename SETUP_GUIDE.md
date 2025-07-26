# MongoDB User Authentication Setup Guide

This guide will walk you through setting up a complete user authentication system with MongoDB for your ecommerce application.

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5.0 or higher)
- npm or yarn package manager
- Basic knowledge of JavaScript and Express.js

## 🚀 Quick Start

### Step 1: MongoDB Installation and Setup

#### Option A: Local MongoDB Installation

1. **Download and Install MongoDB**
   ```bash
   # On macOS using Homebrew
   brew tap mongodb/brew
   brew install mongodb-community

   # On Ubuntu/Debian
   sudo apt-get install -y mongodb

   # On Windows
   # Download from https://www.mongodb.com/try/download/community
   ```

2. **Start MongoDB Service**
   ```bash
   # On macOS/Linux
   sudo systemctl start mongod

   # Or using Homebrew on macOS
   brew services start mongodb-community

   # On Windows
   # MongoDB should start automatically after installation
   ```

3. **Verify MongoDB is Running**
   ```bash
   # Connect to MongoDB shell
   mongosh

   # You should see a connection message
   # Type 'exit' to quit the shell
   ```

#### Option B: MongoDB Atlas (Cloud Database)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster

2. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

### Step 2: Project Setup

1. **Create Project Directory**
   ```bash
   mkdir onetech-auth-backend
   cd onetech-auth-backend
   ```

2. **Initialize Node.js Project**
   ```bash
   npm init -y
   ```

3. **Install Dependencies**
   ```bash
   # Core dependencies
   npm install express mongoose bcryptjs jsonwebtoken express-validator

   # Security middleware
   npm install cors helmet express-rate-limit express-mongo-sanitize xss-clean hpp cookie-parser

   # Environment variables
   npm install dotenv

   # Development dependencies
   npm install --save-dev nodemon jest supertest
   ```

### Step 3: Environment Configuration

1. **Create Environment File**
   ```bash
   cp .env.example .env
   ```

2. **Configure Environment Variables**
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=5000

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/onetech_ecommerce
   # For MongoDB Atlas, use your connection string:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/onetech_ecommerce

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
   JWT_EXPIRES_IN=7d

   # Client Configuration
   CLIENT_URL=http://localhost:3000
   ```

3. **Generate Secure JWT Secret**
   ```bash
   # Generate a secure random string
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

### Step 4: Database Setup

1. **Create Database and Collections**
   ```bash
   # Connect to MongoDB
   mongosh

   # Create database
   use onetech_ecommerce

   # Create users collection with validation
   db.createCollection("users", {
     validator: {
       $jsonSchema: {
         bsonType: "object",
         required: ["name", "email", "password"],
         properties: {
           name: {
             bsonType: "string",
             minLength: 2,
             maxLength: 50
           },
           email: {
             bsonType: "string",
             pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
           },
           password: {
             bsonType: "string",
             minLength: 8
           }
         }
       }
     }
   })

   # Create indexes for performance
   db.users.createIndex({ "email": 1 }, { unique: true })
   db.users.createIndex({ "emailVerificationToken": 1 })
   db.users.createIndex({ "passwordResetToken": 1 })
   ```

### Step 5: Start the Server

1. **Add Scripts to package.json**
   ```json
   {
     "scripts": {
       "start": "node app.js",
       "dev": "nodemon app.js",
       "test": "jest"
     }
   }
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Verify Server is Running**
   ```bash
   # Test health endpoint
   curl http://localhost:5000/api/health
   ```

## 🔧 Configuration Options

### JWT Configuration

```javascript
// Customize JWT settings in authController.js
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { 
      expiresIn: '7d',        // Token expiration
      issuer: 'onetech-api',  // Token issuer
      audience: 'onetech-app' // Token audience
    }
  );
};
```

### Password Security

```javascript
// Adjust bcrypt rounds in User model (higher = more secure but slower)
const salt = await bcrypt.genSalt(12); // Default: 12 rounds
```

### Rate Limiting

```javascript
// Customize rate limits in app.js
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                   // 5 attempts per window
  message: 'Too many authentication attempts'
});
```

## 🧪 Testing the API

### Test User Registration

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "phone": "+1234567890"
  }'
```

### Test User Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Test Protected Route

```bash
# Replace YOUR_JWT_TOKEN with the token from login response
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔍 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```
   Error: connect ECONNREFUSED 127.0.0.1:27017
   ```
   **Solution**: Ensure MongoDB is running
   ```bash
   sudo systemctl start mongod
   # or
   brew services start mongodb-community
   ```

2. **JWT Secret Error**
   ```
   Error: secretOrPrivateKey has a minimum key size of 256 bits
   ```
   **Solution**: Use a longer JWT secret (at least 32 characters)

3. **Validation Errors**
   ```
   ValidationError: Path `email` is required
   ```
   **Solution**: Check request body format and required fields

4. **CORS Errors**
   ```
   Access to fetch at 'http://localhost:5000' from origin 'http://localhost:3000' has been blocked by CORS policy
   ```
   **Solution**: Update CLIENT_URL in .env file

### Debug Mode

Enable detailed logging:
```bash
DEBUG=* npm run dev
```

### Database Inspection

```bash
# Connect to MongoDB shell
mongosh

# Switch to your database
use onetech_ecommerce

# View all users
db.users.find().pretty()

# Check indexes
db.users.getIndexes()
```

## 📚 Next Steps

1. **Email Verification**: Implement email verification for new users
2. **Password Reset**: Add forgot password functionality
3. **Social Login**: Integrate OAuth providers (Google, Facebook)
4. **Two-Factor Authentication**: Add 2FA for enhanced security
5. **Session Management**: Implement refresh tokens
6. **Audit Logging**: Track user activities
7. **API Documentation**: Generate Swagger/OpenAPI docs

## 🔒 Security Checklist

- ✅ Passwords are hashed with bcrypt
- ✅ JWT tokens are properly signed
- ✅ Rate limiting is implemented
- ✅ Input validation and sanitization
- ✅ CORS is configured
- ✅ Security headers are set
- ✅ Account lockout after failed attempts
- ✅ Environment variables for secrets
- ✅ HTTPS in production (configure reverse proxy)
- ✅ Database connection security

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review server logs for error details
3. Verify environment variables are set correctly
4. Ensure MongoDB is running and accessible
5. Test with the provided curl commands

For additional help, refer to the official documentation:
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)