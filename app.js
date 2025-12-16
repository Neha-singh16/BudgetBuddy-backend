// const express = require("express");
// const { connectDB } = require("./src/config/database");
// const cookieParser = require("cookie-parser");
// const cors = require("cors");
// const mongoose = require("mongoose"); // ✅ You need this for the Category model to work
// const { Category } = require("./src/config/model/category");
// require("dotenv").config();

// const path = require("path");
// const app = express();

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );

// app.use(express.json());
// app.use(cookieParser());

// // Routers
// const auth = require("./src/config/router/authRouter");
// const { expenseRouter } = require("./src/config/router/expenseRouter");
// const { categoryRouter } = require("./src/config/router/categoryRouter");
// const { budgetRouter } = require("./src/config/router/budgetRouter");

// const profileRouter = require("./src/config/router/profileRouter");
// const incomeRouter = require("./src/config/router/incomeRouter");

// // Default categories
// const defaultCategories = [
//   "Food",
//   "Transport",
//   "Bills & Utilities",
//   "Entertainment",
//   "Shopping",
//   "Education",
//   "Health",
//   "Travel",
//   "Groceries",
//   "Others",
// ];

// // Seed function (without connecting/disconnecting again)
// async function seedDefaultCategories() {
//   for (const name of defaultCategories) {
//     const exists = await Category.findOne({ name, userId: null });
//     if (!exists) {
//       await Category.create({ name });
//       console.log(`Created: ${name}`);
//     }
//   }
//   console.log("✅ Default categories seeded.");
// }

// // Connect DB, then seed, then start server
// connectDB()
//   .then(async () => {
//     console.log("✅ The database is now connected!!");

//     await seedDefaultCategories(); // 👈 Seed categories after DB is connected

//     app.listen(3000, () => {
//       console.log("🚀 Server running on port 3000.");
//     });
//   })
//   .catch((err) => {
//     console.error("❌ The database is not connected!!", err);
//   });

// // Routes
// app.use("/", auth);
// app.use("/", expenseRouter);
// app.use("/", categoryRouter);
// app.use("/", budgetRouter);
// app.use("/", profileRouter);
// app.use("/", incomeRouter);


const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const mongoose = require("mongoose");
const { connectDB } = require("./src/config/database");
const { Category } = require("./src/config/model/category");

// Router imports
const auth = require("./src/config/router/authRouter");
const { expenseRouter } = require("./src/config/router/expenseRouter");
const { categoryRouter } = require("./src/config/router/categoryRouter");
const { budgetRouter } = require("./src/config/router/budgetRouter");
const profileRouter = require("./src/config/router/profileRouter");
const incomeRouter = require("./src/config/router/incomeRouter");

const app = express();

// CORS configuration - MUST be before other middleware
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CORS_ORIGIN || "http://localhost:5173",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:3000"
    ];
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 200,
  preflightContinue: false,
};


// const corsOptions = {
//   origin: 'http://localhost:5173',  
//   credentials: true
// }



app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// health check
app.get("/", (req, res) => res.send("🟢 Backend is live!"));


const defaultCategories = [
  "Food",
  "Transport",
  "Bills & Utilities",
  "Entertainment",
  "Shopping",
  "Education",
  "Health",
  "Travel",
  "Groceries",
  "Others",
];
async function seedDefaultCategories() {
  for (const name of defaultCategories) {
    const exists = await Category.findOne({ name, userId: null });
    if (!exists) await Category.create({ name });
  }
  console.log("✅ Default categories seeded.");
}

app.use("/", auth);
app.use("/", expenseRouter);
app.use("/", categoryRouter);
app.use("/", budgetRouter);
app.use("/", profileRouter);
app.use("/", incomeRouter);

// 404 handler - MUST be after all routes
app.use((req, res, next) => {
  res.status(404).json({ 
    success: false,
    error: "Route not found",
    path: req.originalUrl 
  });
});

// Global error handler - MUST be last
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err.stack || err.message);
  
  // Handle CORS errors
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ 
      success: false,
      error: "CORS policy: Origin not allowed" 
    });
  }
  
  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({ 
      success: false,
      error: "Validation failed",
      details: Object.values(err.errors).map(e => e.message)
    });
  }
  
  // Handle Mongoose cast errors (invalid ID format)
  if (err.name === "CastError") {
    return res.status(400).json({ 
      success: false,
      error: "Invalid ID format" 
    });
  }
  
  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ 
      success: false,
      error: "Invalid token" 
    });
  }
  
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ 
      success: false,
      error: "Token expired" 
    });
  }
  
  // Handle duplicate key errors (MongoDB)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({ 
      success: false,
      error: `${field} already exists` 
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({ 
    success: false,
    error: process.env.NODE_ENV === "production" 
      ? "Internal server error" 
      : err.message 
  });
});

// bootstrapping
async function startServer() {
  // 1) Connect to Mongo
  await connectDB();
  console.log("✅ MongoDB connected successfully");

  // 2) If we’re _not_ in production, seed defaults
  if (process.env.NODE_ENV !== "production") {
    await seedDefaultCategories().catch((e) => console.error("Seed error:", e));
  }

  // 3) Always start listening
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(
      `🟢 EXPRESS SERVER STARTED in ${
        process.env.NODE_ENV || "development"
      } on port ${port}`
    );
    console.log(`📍 Server URL: http://localhost:${port}`);
    console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || "http://localhost:5173"}`);
  });
}

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("💥 UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("💥 UNHANDLED REJECTION! Shutting down...");
  console.error(err);
  process.exit(1);
});

// kick it off
startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});

module.exports = app;
