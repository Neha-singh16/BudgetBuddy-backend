# BudgetBuddy Backend API 🚀

A robust RESTful API built with Node.js, Express, and MongoDB that powers the BudgetBuddy personal finance management application. Provides secure authentication, CRUD operations for expenses, budgets, income, and categories with comprehensive validation and error handling.

## 🌟 Features

### Core Functionality
- **User Authentication**: JWT-based auth with bcrypt password hashing
- **Expense Management**: Full CRUD operations for expense tracking
- **Budget System**: Create and monitor budgets with category linkage
- **Income Tracking**: Record and manage multiple income sources
- **Category Management**: Pre-seeded default categories + custom user categories
- **Profile Management**: Update user details and change passwords
- **Auto-seeding**: Default categories automatically created on startup

### Security Features
- JWT token authentication
- httpOnly cookie storage
- bcrypt password hashing (10 salt rounds)
- Input validation using validator library
- CORS protection with configurable origins
- Secure password requirements
- Protected routes with auth middleware

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|-----------|---------|---------|
| **Node.js** | Runtime environment | Latest LTS |
| **Express 5** | Web framework | ^5.1.0 |
| **MongoDB** | Database | Atlas/Local |
| **Mongoose** | ODM for MongoDB | ^8.13.2 |
| **JWT** | Authentication | ^9.0.2 |
| **bcrypt** | Password hashing | ^5.1.1 |
| **validator** | Input validation | ^13.15.0 |
| **cors** | Cross-origin requests | ^2.8.5 |
| **cookie-parser** | Cookie handling | ^1.4.7 |
| **dotenv** | Environment config | ^16.5.0 |
| **multer** | File uploads | ^2.0.1 |

## 📁 Project Structure

```
budgetBuddy-backend/
├── app.js                    # Main application entry point
├── package.json              # Dependencies and scripts
├── vercel.json              # Vercel deployment config
├── .env                     # Environment variables (not in repo)
├── public/                  # Static files (if any)
└── src/
    └── config/
        ├── database.js      # MongoDB connection
        ├── middleware/
        │   └── auth.js      # JWT authentication middleware
        ├── model/           # Mongoose schemas
        │   ├── users.js     # User model
        │   ├── expenses.js  # Expense model
        │   ├── budget.js    # Budget model
        │   ├── Income.js    # Income model
        │   └── category.js  # Category model
        ├── router/          # API route handlers
        │   ├── authRouter.js      # Auth routes
        │   ├── expenseRouter.js   # Expense routes
        │   ├── budgetRouter.js    # Budget routes
        │   ├── incomeRouter.js    # Income routes
        │   ├── categoryRouter.js  # Category routes
        │   └── profileRouter.js   # Profile routes
        └── utils/
            └── validate.js  # Validation functions
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18 or higher
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)

### Installation

1. **Navigate to backend directory**
   ```powershell
   cd budgetBuddy-backend
   ```

2. **Install dependencies**
   ```powershell
   npm install
   ```

3. **Configure environment variables**
   
   Create `.env` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/budgetbuddy
   
   # JWT Secret (use a strong random string)
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # CORS Configuration
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Start the server**

   **Development mode** (with auto-reload):
   ```powershell
   npm run dev
   ```

   **Production mode**:
   ```powershell
   npm start
   ```

   The server will start at `http://localhost:3000`

### Available Scripts

```powershell
npm start       # Start production server
npm run dev     # Start development server with nodemon
npm test        # Run tests (not implemented yet)
```

## 🔄 Application Flow

### Server Startup Flow
```
1. Load environment variables (.env)
   ↓
2. Initialize Express app
   ↓
3. Configure CORS with allowed origins
   ↓
4. Apply middleware (JSON parser, cookie-parser)
   ↓
5. Connect to MongoDB
   ↓
6. Seed default categories (if not exist)
   ↓
7. Register API routes
   ↓
8. Start listening on PORT 3000
```

### Request Processing Flow
```
Incoming Request
   ↓
CORS Check (origin validation)
   ↓
Cookie Parser (extract JWT from cookie)
   ↓
Route Matching
   ↓
Auth Middleware (if protected route)
   ├─ Verify JWT token
   ├─ Extract user ID
   └─ Attach user to req object
   ↓
Route Handler
   ├─ Validate input
   ├─ Process business logic
   ├─ Database operations
   └─ Send response
   ↓
Error Handler (if error occurs)
```

## 📡 API Reference

### Base URL
```
Development: http://localhost:3000
Production: https://your-domain.com
```

### Authentication Endpoints

#### 1. Sign Up
```http
POST /signup
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "StrongPass123!"
}

Response: 201 Created
{
  "_id": "user_id",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com"
}
```

#### 2. Login
```http
POST /login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "StrongPass123!"
}

Response: 200 OK
{
  "_id": "user_id",
  "firstName": "John",
  "email": "john.doe@example.com"
}
Set-Cookie: token=<JWT>; HttpOnly; SameSite=Lax
```

#### 3. Logout
```http
POST /logout
Cookie: token=<JWT>

Response: 200 OK
{
  "message": "Logout successful"
}
```

### Profile Endpoints

#### 4. Get Profile
```http
GET /profile
Cookie: token=<JWT>

Response: 200 OK
{
  "_id": "user_id",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com"
}
```

#### 5. Update Profile
```http
PATCH /profile
Cookie: token=<JWT>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith"
}

Response: 200 OK
{
  "message": "Profile updated successfully"
}
```

#### 6. Change Password
```http
PATCH /profile/password
Cookie: token=<JWT>
Content-Type: application/json

{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}

Response: 200 OK
{
  "message": "Password changed successfully"
}
```

### Expense Endpoints

#### 7. Get All Expenses
```http
GET /user/expense
Cookie: token=<JWT>

Response: 200 OK
[
  {
    "_id": "expense_id",
    "amount": 50.00,
    "category": "category_id",
    "description": "Grocery shopping",
    "date": "2025-12-15T00:00:00.000Z",
    "budget": "budget_id"
  }
]
```

#### 8. Create Expense
```http
POST /user/expense
Cookie: token=<JWT>
Content-Type: application/json

{
  "amount": 50.00,
  "category": "category_id",
  "description": "Grocery shopping",
  "date": "2025-12-15",
  "budget": "budget_id"
}

Response: 201 Created
{
  "_id": "new_expense_id",
  "amount": 50.00,
  "category": "category_id",
  ...
}
```

#### 9. Update Expense
```http
PATCH /user/expense/:id
Cookie: token=<JWT>
Content-Type: application/json

{
  "amount": 55.00,
  "description": "Updated description"
}

Response: 200 OK
{
  "message": "Expense updated successfully"
}
```

#### 10. Delete Expense
```http
DELETE /user/expense/:id
Cookie: token=<JWT>

Response: 200 OK
{
  "message": "Expense deleted successfully"
}
```

### Budget Endpoints

#### 11. Get All Budgets
```http
GET /user/budget
Cookie: token=<JWT>

Response: 200 OK
[
  {
    "_id": "budget_id",
    "limit": 500.00,
    "category": "category_id",
    "period": "monthly",
    "isActive": true
  }
]
```

#### 12. Create Budget
```http
POST /user/budget
Cookie: token=<JWT>
Content-Type: application/json

{
  "limit": 500.00,
  "category": "category_id",
  "period": "monthly"
}

Response: 201 Created
{
  "_id": "new_budget_id",
  "limit": 500.00,
  ...
}
```

#### 13. Update Budget
```http
PATCH /user/budget/:id
Cookie: token=<JWT>
Content-Type: application/json

{
  "limit": 600.00,
  "isActive": false
}

Response: 200 OK
{
  "message": "Budget updated successfully"
}
```

#### 14. Delete Budget
```http
DELETE /user/budget/:id
Cookie: token=<JWT>

Response: 200 OK
{
  "message": "Budget deleted successfully"
}
```

### Income Endpoints

#### 15. Get All Income
```http
GET /user/income
Cookie: token=<JWT>

Response: 200 OK
[
  {
    "_id": "income_id",
    "amount": 5000.00,
    "source": "Salary",
    "description": "Monthly salary",
    "date": "2025-12-01T00:00:00.000Z"
  }
]
```

#### 16. Create Income
```http
POST /user/income
Cookie: token=<JWT>
Content-Type: application/json

{
  "amount": 5000.00,
  "source": "Salary",
  "description": "Monthly salary",
  "date": "2025-12-01"
}

Response: 201 Created
{
  "_id": "new_income_id",
  "amount": 5000.00,
  ...
}
```

#### 17. Update Income
```http
PATCH /user/income/:id
Cookie: token=<JWT>
Content-Type: application/json

{
  "amount": 5500.00
}

Response: 200 OK
{
  "message": "Income updated successfully"
}
```

#### 18. Delete Income
```http
DELETE /user/income/:id
Cookie: token=<JWT>

Response: 200 OK
{
  "message": "Income deleted successfully"
}
```

### Category Endpoints

#### 19. Get All Categories
```http
GET /category
Cookie: token=<JWT>

Response: 200 OK
[
  {
    "_id": "category_id",
    "name": "Food",
    "userId": null  // Default category
  },
  {
    "_id": "custom_category_id",
    "name": "Subscriptions",
    "userId": "user_id"  // Custom category
  }
]
```

#### 20. Create Custom Category
```http
POST /category
Cookie: token=<JWT>
Content-Type: application/json

{
  "name": "Subscriptions"
}

Response: 201 Created
{
  "_id": "new_category_id",
  "name": "Subscriptions",
  "userId": "user_id"
}
```

## 🗄️ Database Models

### User Model
```javascript
{
  firstName: { type: String, required: true, minLength: 3, maxLength: 100 },
  lastName: { type: String, minLength: 3, maxLength: 50 },
  email: { type: String, unique: true, required: true, validated },
  password: { type: String, required: true, hashed, minLength: 8 },
  createdAt: { type: Date, default: Date.now }
}
```

### Expense Model
```javascript
{
  userId: { type: ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0 },
  category: { type: ObjectId, ref: 'Category', required: true },
  description: { type: String },
  date: { type: Date, default: Date.now },
  budget: { type: ObjectId, ref: 'Budget' }
}
```

### Budget Model
```javascript
{
  userId: { type: ObjectId, ref: 'User', required: true },
  limit: { type: Number, required: true, min: 0 },
  category: { type: ObjectId, ref: 'Category', required: true },
  period: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}
```

### Income Model
```javascript
{
  userId: { type: ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0 },
  source: { type: String, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now }
}
```

### Category Model
```javascript
{
  name: { type: String, required: true, unique: true },
  userId: { type: ObjectId, ref: 'User', default: null }
  // userId = null means it's a default category
}
```

## 🔐 Authentication & Authorization

### JWT Authentication Flow
```
1. User logs in with email/password
   ↓
2. Server validates credentials
   ↓
3. Generate JWT token with user ID
   ↓
4. Set httpOnly cookie with token
   ↓
5. Client includes cookie in subsequent requests
   ↓
6. Auth middleware verifies token
   ↓
7. Attach user ID to request object
   ↓
8. Route handler processes request
```

### Auth Middleware
```javascript
// src/config/middleware/auth.js
const userAuth = async (req, res, next) => {
  // 1. Extract token from cookie
  const token = req.cookies.token;
  
  // 2. Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  // 3. Find user in database
  const user = await User.findById(decoded.id);
  
  // 4. Attach to request
  req.user = user;
  
  next();
}
```

### Protected Routes
All routes except `/signup` and `/login` require authentication.

## 🛡️ Security Best Practices

### Password Security
- Bcrypt hashing with 10 salt rounds
- Strong password validation (uppercase, lowercase, numbers, symbols)
- Minimum 8 characters

### JWT Security
- Stored in httpOnly cookies (prevents XSS)
- 24-hour expiration
- Secure flag in production
- SameSite=Lax protection

### CORS Configuration
```javascript
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CORS_ORIGIN,
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000"
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"]
}
```

### Input Validation
- Email format validation
- Strong password requirements
- Amount range validation
- Sanitization of user inputs

## 🌱 Database Seeding

### Default Categories
The application auto-seeds 10 default categories on startup:
- Food
- Transport
- Bills & Utilities
- Entertainment
- Shopping
- Education
- Health
- Travel
- Groceries
- Others

These are created with `userId: null` to distinguish them from custom user categories.

```javascript
async function seedDefaultCategories() {
  for (const name of defaultCategories) {
    const exists = await Category.findOne({ name, userId: null });
    if (!exists) await Category.create({ name });
  }
}
```

## ⚠️ Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "details": ["Additional error details"]
}
```

### Error Types Handled
1. **Validation Errors** (400)
   - Missing required fields
   - Invalid data format
   - Mongoose validation failures

2. **Authentication Errors** (401)
   - Invalid credentials
   - Missing/expired token
   - Unauthorized access

3. **Not Found Errors** (404)
   - Resource not found
   - Invalid route

4. **CORS Errors** (403)
   - Origin not allowed

5. **Server Errors** (500)
   - Database connection issues
   - Unexpected errors

### Global Error Handler
```javascript
app.use((err, req, res, next) => {
  console.error(err.stack || err.message);
  
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ 
      success: false,
      error: "CORS policy: Origin not allowed" 
    });
  }
  
  if (err.name === "ValidationError") {
    return res.status(400).json({ 
      success: false,
      error: "Validation failed",
      details: Object.values(err.errors).map(e => e.message)
    });
  }
  
  res.status(500).json({ 
    success: false,
    error: "Internal server error" 
  });
});
```

## 🧪 Testing

### Health Check
```http
GET /
Response: "🟢 Backend is live!"
```

### Manual Testing with Postman/Thunder Client
1. Sign up a new user
2. Login to get JWT cookie
3. Test protected endpoints
4. Verify CRUD operations
5. Test error scenarios

### Automated Testing (To Be Implemented)
- Unit tests for models
- Integration tests for routes
- End-to-end API tests
- Authentication flow tests

## 🚀 Deployment

### Environment Variables for Production
```env
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=strong-random-production-secret
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
PORT=3000
```

### Deployment Platforms

#### Vercel
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "app.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "app.js"
    }
  ]
}
```

#### Heroku
```powershell
heroku create budgetbuddy-api
heroku config:set MONGODB_URI=your-uri
heroku config:set JWT_SECRET=your-secret
git push heroku main
```

#### Railway/Render
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Pre-Deployment Checklist
- [ ] Update CORS_ORIGIN to production frontend URL
- [ ] Set strong JWT_SECRET (use crypto.randomBytes)
- [ ] Configure MongoDB Atlas with IP whitelist
- [ ] Enable MongoDB Atlas backup
- [ ] Set NODE_ENV=production
- [ ] Test all API endpoints
- [ ] Configure rate limiting (recommended)
- [ ] Set up logging service
- [ ] Configure error monitoring (Sentry, etc.)

## 📊 Performance Optimization

### Database Indexing
```javascript
// Add indexes for frequently queried fields
userSchema.index({ email: 1 });
expenseSchema.index({ userId: 1, date: -1 });
budgetSchema.index({ userId: 1, isActive: 1 });
```

### Query Optimization
- Use `.lean()` for read-only queries
- Select only required fields
- Implement pagination for large datasets
- Use aggregation pipeline for complex queries

### Caching (Future Enhancement)
- Redis for session storage
- Cache frequently accessed data
- Implement cache invalidation strategy

## 🔧 Configuration

### CORS Configuration
Supports multiple frontend origins for development flexibility.

### Cookie Configuration
```javascript
res.cookie("token", token, {
  httpOnly: true,              // Prevents XSS
  sameSite: "lax",            // CSRF protection
  secure: NODE_ENV === "production",  // HTTPS only in prod
  maxAge: 24 * 60 * 60 * 1000,       // 1 day
  path: "/"
});
```

### Body Parser Limits
```javascript
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
```

## 🐛 Debugging

### Enable Debug Logs
```javascript
// In database.js
mongoose.set('debug', true);  // Log all queries
```

### Common Issues

**Problem**: MongoDB connection fails
- **Solution**: Check MONGODB_URI, network connectivity, Atlas IP whitelist

**Problem**: JWT token not found
- **Solution**: Ensure cookies are sent with requests (credentials: 'include')

**Problem**: CORS errors
- **Solution**: Verify frontend origin is in allowedOrigins array

**Problem**: Validation errors
- **Solution**: Check request body matches model schema requirements

## 📚 Additional Resources

- [Express Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Best Practices](https://jwt.io/introduction)
- [MongoDB Atlas Setup](https://www.mongodb.com/cloud/atlas)
- [Node.js Security Checklist](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/NewFeature`)
3. Write tests for new features
4. Commit changes (`git commit -m 'Add NewFeature'`)
5. Push to branch (`git push origin feature/NewFeature`)
6. Open Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Express.js community
- MongoDB team
- All open-source contributors

## 📞 Support

For API issues:
- Check this README
- Review frontend README for integration
- Create GitHub issue with details

---

**Build Secure, Scale Smart! 🔐🚀**
