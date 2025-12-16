const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb+srv://FeedUs:3ElTOiOVKU8JwnTv@namastebuddy.u2xmv8k.mongodb.net/?appName=NamasteBuddy";
    await mongoose.connect(uri, {
      autoIndex: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
};

module.exports = { connectDB };
