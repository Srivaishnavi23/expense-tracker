const express = require("express");

const router = express.Router();

const expenseController = require("../controllers/expense");

const { authentication, isPremiumUser } = require("../middleware/auth");

router.post("/addExpense", authentication, expenseController.postAddExpense);

router.delete(
  "/delete/:expenseId",
  authentication,
  expenseController.deleteExpense
);

router.get(
  "/download",
  authentication,
  isPremiumUser,
  expenseController.downloadExpenseReport
);

router.get(
  "/download/history",
  authentication,
  isPremiumUser,
  expenseController.getExpenseReportDownloadHistory
);

router.get("", authentication, expenseController.getAllExpense);

module.exports = router;