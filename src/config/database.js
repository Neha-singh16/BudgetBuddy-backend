const mongoose = require("mongoose");

let cached = global.__mongooseConn;
if (!cached) {
  cached = global.__mongooseConn = { conn: null, promise: null };
}

async function connectDB() {
  const uri =
    process.env.MONGODB_URI ||
    "MONGODB_URI=mongodb+srv://FeedUs:3ElTOiOVKU8JwnTv@namastebuddy.u2xmv8k.mongodb.net/?appName=NamasteBuddy";

  // Reuse existing connection when available
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        autoIndex: true,
        serverSelectionTimeoutMS: 10000, // fail fast for bad URIs or networking
        maxPoolSize: 10,
        dbName: process.env.MONGODB_DB || undefined,
      })
      .then((m) => {
        console.log("MongoDB connected successfully");
        return m.connection;
      })
      .catch((err) => {
        console.error("MongoDB connection error:", err?.message || err);
        cached.promise = null; // allow retry on next call
        throw err;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connectDB };
