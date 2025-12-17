const express = require("express");

const budgetRouter = express.Router();
const { Budget } = require("../model/budget");
const { BudgetArchive } = require("../model/budgetArchive");
const { userAuth } = require("../middleware/auth");
const { Category } = require("../model/category");
const { Expense } = require("../model/expenses");
const { Income } = require("../model/Income");
const mongoose = require("mongoose");

budgetRouter.post("/user/budget", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { categoryId, limit, period } = req.body;
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const budget = new Budget({
      userId: userId,
      categoryId: categoryId,
      parentCategoryId: category.parentCategoryId || null,
      limit,
      period,
    });

    const saved = await budget.save();

    return res.status(201).json(saved);
  } catch (err) {
    res.status(400).send(` Error: ${err.message}`);
  }
});

budgetRouter.get("/user/budget", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const allBudget = await Budget.find({ userId: userId });
    res.json(allBudget);
  } catch (err) {
    res.status(400).send(` Error: ${err.message}`);
  }
});

budgetRouter.get("/user/budget/:budgetId", userAuth, async (req, res) => {
  try {
    const { budgetId } = req.params;
    const userId = req.user._id;

    const budget = await Budget.findOne({ _id: budgetId, userId: userId })
      .populate("categoryId")
      .populate("parentCategoryId")
      .lean();
    if (!budget) {
      return res.status(404).json({ error: "Budget not found" });
    }

    res.json(budget);
  } catch (err) {
    res.status(400).send(`Error : ${err.message}`);
  }
});

budgetRouter.patch("/user/budget/:budgetId", userAuth, async (req, res) => {
  try {
    const { budgetId } = req.params;
    const userId = req.user._id;

    const budget = await Budget.findOneAndUpdate(
      {
        _id: budgetId,
        userId: userId,
      },
      {
        $set: req.body,
      },
      {
        new: true,
        runvalidators: true,
      }
    )
      .populate("categoryId")
      .lean();

    if (!budget) {
      return res.status(404).json({ error: "Budget not found" });
    }

    return res.status(200).json({
      message: `${budget.categoryId._id} and ${budget.categoryId.name} has been updated!`,
      budget,
    });
  } catch (err) {
    res.status(400).send(`Error : ${err.message}`);
  }
});



budgetRouter.delete("/user/budget/:id", userAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const budget = await Budget.findOneAndDelete({ _id: id, userId });

  if (!budget) return res.status(404).json({ error: "Budget not found" });

  const Expense = mongoose.model("Expense");
  const Category = mongoose.model("Category");

  await Expense.deleteMany({ budget: budget._id });
  await Category.deleteMany({ budgetId: budget._id });

  res.json({ success: true, message: "Budget and its children deleted." });
});

// Get user's balance (income - expenses)
budgetRouter.get("/user/balance", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const totalIncome = await Income.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalExpenses = await Expense.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const income = totalIncome[0]?.total || 0;
    const expenses = totalExpenses[0]?.total || 0;
    const balance = income - expenses;

    res.json({
      totalIncome: income,
      totalExpenses: expenses,
      balance,
      status: balance >= 0 ? "healthy" : "deficit",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Archive current budget and reset (manual trigger)
budgetRouter.post("/user/budget/:budgetId/archive-and-reset", userAuth, async (req, res) => {
  try {
    const { budgetId } = req.params;
    const userId = req.user._id;

    const budget = await Budget.findOne({ _id: budgetId, userId });
    if (!budget) return res.status(404).json({ error: "Budget not found" });

    // Calculate total spent in this period
    const expenses = await Expense.find({ budget: budgetId });
    const spent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const percentageUsed = Math.round((spent / budget.limit) * 100);

    // Determine status
    let status = "under";
    if (percentageUsed >= 100) status = "over";
    else if (percentageUsed >= 80) status = "at-limit";

    const category = await Category.findById(budget.categoryId);

    // Create archive entry
    const archive = new BudgetArchive({
      userId,
      originalBudgetId: budgetId,
      categoryId: budget.categoryId,
      categoryName: category?.name || "Unknown",
      limit: budget.limit,
      spent,
      period: budget.period,
      status,
      percentageUsed,
      periodEndDate: new Date(),
    });

    await archive.save();

    // Update budget lastResetDate
    budget.lastResetDate = new Date();
    await budget.save();

    res.json({
      message: "Budget archived and reset successfully",
      archive,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get budget history for user (filtered by period)
budgetRouter.get("/user/budget-history", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { period } = req.query; // "weekly", "monthly", "yearly"

    let query = { userId };
    if (period) {
      query.period = period;
    }

    const archives = await BudgetArchive.find(query)
      .populate("categoryId")
      .sort({ archivedAt: -1 })
      .limit(50);

    res.json(archives);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update reset preference (manual/automatic)
budgetRouter.patch("/user/budget/:budgetId/reset-preference", userAuth, async (req, res) => {
  try {
    const { budgetId } = req.params;
    const { resetPreference } = req.body;
    const userId = req.user._id;

    if (!["manual", "automatic"].includes(resetPreference)) {
      return res.status(400).json({ error: "Invalid reset preference" });
    }

    const budget = await Budget.findOneAndUpdate(
      { _id: budgetId, userId },
      { resetPreference },
      { new: true }
    );

    if (!budget) return res.status(404).json({ error: "Budget not found" });

    res.json({ message: "Reset preference updated", budget });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get performance metrics for reward system
budgetRouter.get("/user/performance", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    const budgets = await Budget.find({ userId });
    const expenses = await Expense.find({ userId });

    const metrics = {
      totalBudgets: budgets.length,
      underBudgetCount: 0,
      atLimitCount: 0,
      overBudgetCount: 0,
      averagePercentageUsed: 0,
      streak: 0,
    };

    let totalPercentage = 0;

    budgets.forEach((b) => {
      const spent = expenses
        .filter((e) => e.budget.toString() === b._id.toString())
        .reduce((sum, e) => sum + Number(e.amount), 0);

      const percentage = Math.round((spent / b.limit) * 100);
      totalPercentage += percentage;

      if (percentage < 80) metrics.underBudgetCount++;
      else if (percentage < 100) metrics.atLimitCount++;
      else metrics.overBudgetCount++;
    });

    metrics.averagePercentageUsed = metrics.totalBudgets ? Math.round(totalPercentage / metrics.totalBudgets) : 0;
    metrics.streak = metrics.underBudgetCount > 0 ? Math.floor(metrics.underBudgetCount / 2) : 0;

    res.json(metrics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = {
  budgetRouter,
};
