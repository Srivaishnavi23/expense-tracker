const LeaderBoard = require("../models/leaderboard");

const Expense = require("../models/expense");

exports.showAllLeaderbord = async (req, res) => {
  try {
    let user = req.user;

    if (user.membership == "free") {
      return res.status(401).json({
        success: false,
        message: "Buy Premium Membership To access this feature",
      });
    }

    let leaderboard = await LeaderBoard.findAll({
      order: [["totalExpenses", "DESC"]],
    });

    res.json({ requestUserId: req.user.id, leaderboard });
  } catch (error) {
    console.log("\n showAllLeaderbord ==> \n ", error);

    res.status(500).json({ success: false, message: error.message });
  }
};

exports.showUserExpense = async (req, res) => {
  try {
    let user = req.user;

    let userId = req.body.userId;

    if (user.membership == "free") {
      return res.status(401).json({
        success: false,
        message: "Buy Premium Membership To access this feature",
      });
    }

    let usersExp = await Expense.findAll({
      where: {
        userId,
      },
    });

    if (usersExp.length == 0) {
      return res.json({
        success: true,
        message: "No expense Found ",
        usersExp,
      });
    }

    res.status(200).json({ success: true, usersExp });
  } catch (error) {
    console.log("\n showAllLeaderbord ==> \n ", error);

    res.status(500).json({ success: false, message: error.message });
  }
};