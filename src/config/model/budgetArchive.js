const mongoose = require("mongoose");

const budgetArchiveSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  originalBudgetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Budget",
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  categoryName: {
    type: String,
  },
  limit: {
    type: Number,
    required: true,
  },
  spent: {
    type: Number,
    default: 0,
  },
  period: {
    type: String,
    enum: ["weekly", "monthly", "yearly"],
    default: "monthly",
  },
  status: {
    type: String,
    enum: ["under", "at-limit", "over"],
    default: "under",
  },
  percentageUsed: {
    type: Number,
    default: 0,
  },
  archivedAt: {
    type: Date,
    default: Date.now,
  },
  periodStartDate: {
    type: Date,
  },
  periodEndDate: {
    type: Date,
  },
});

const BudgetArchive = mongoose.model("BudgetArchive", budgetArchiveSchema);

module.exports = {
  BudgetArchive,
};
