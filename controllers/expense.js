const Expense = require("../models/expense");

//utils
const { convertFromJSON_to_CSV } = require("../util/converters");

// services
const { uploadToS3 } = require("../services/S3service");
const { getExpenses, getDownloads } = require("../services/userservices");

module.exports.postAddExpense = async (req, res, next) => {
  try {
    const { expenseAmount, category, description } = req.body;

    if (!expenseAmount || !category) {
      return res
        .status(400)
        .json({ success: false, message: "Field Cannot be empty" });
    }

    let expense = await req.user.createExpense({
      expenseAmount,
      category,
      description,
    });

    //  leaderboard

    let leaderBoard = await req.user.getLeaderBoard();
    console.log("\n\n leaderboard=====> \n\n", leaderBoard, "\n\n");
    if (!leaderBoard) {
      leaderBoard = await req.user.createLeaderBoard({
        userName: req.user.name,
      });
    }

    console.log("\n\n leaderboard=====> \n\n", leaderBoard, "\n\n");

    let total = leaderBoard.totalExpenses + Number(expenseAmount);
    leaderBoard.update({ totalExpenses: total });

    res
      .status(201)
      .json({ success: true, message: "Expense added successfully", expense });
  } catch (error) {
    console.log("\n \n", error, "\n");
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.getAllExpense = async (req, res, next) => {
  try {
    // let expenses = await Expense.findAll({ where: { userId: req.user.id } });

    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit);

    if (limit > 20 || limit < 1 || !limit) limit = 5;

    let totalCount = 0;
    totalCount = await Expense.count({ where: { userId: req.user.id } });
    const lastPage = Math.ceil(totalCount / limit);

    const offset = (page - 1) * limit;

    const pagination = {
      offset,
      limit,
    };

    let expenses = await getExpenses(req, pagination);

    // let expenses = await getExpenses(req, pagination);
    // console.log("\n \n \n ", limit);

    if (expenses.length == 0) {
      return res.status(404).json({
        success: false,
        message: "No Expense Found",
      });
    }

    expenses = expenses.map((expenseObj) => {
      const { id, expenseAmount, category, description, updatedAt, createdAt } =
        expenseObj;
      return {
        id,
        expenseAmount,
        category,
        description,
        createdAt,
        updatedAt,
      };
    });

    let pagiInfo = {
      total: totalCount,
      hasNextPage: limit * page < totalCount,
      hasPrevPage: page > 1,
      nextPg: page + 1,
      prevPg: page - 1,
      lastPage: lastPage,
      limit,
    };

    res.status(200).json({
      success: true,
      message: "Found All Expenses",
      expenses,
      ...pagiInfo,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// delete users expense
module.exports.deleteExpense = async (req, res, next) => {
  try {
    const expenseId = req.params.expenseId;

    if (!expenseId) {
      return res.status(400).json({ success: false, message: "Bad Request" });
    }
    let user = req.user;

    // console.log(user);

    let expense = await Expense.findOne({
      where: {
        id: expenseId,
        userId: user.id,
      },
    });
    // console.log("\n \n \n ", expense, "\n \n");
    if (!expense) {
      return res.status(401).json({
        success: false,
        message: "Expense Does Not Belongs to User",
        error: " Unauthorized Request",
      });
    }

    //  leaderboard

    let leaderBoard = await req.user.getLeaderBoard();
    if (!leaderBoard) {
      leaderBoard = await req.user.createLeaderBoard({
        userName: req.user.name,
      });
    }

    let total = leaderBoard.totalExpenses - Number(expense.expenseAmount);
    leaderBoard.update({ totalExpenses: total });

    await expense.destroy();
    res.json({ success: true, message: "Expense Deleted Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//doenload expense
module.exports.downloadExpenseReport = async (req, res) => {
  try {
    // get
    let expenses = await getExpenses(req);

    if (expenses.length == 0) {
      return res.status(404).json({
        success: false,
        message: "No Expense Found",
      });
    }

    expenses = expenses.map((expenseObj) => {
      const { id, expenseAmount, category, description, updatedAt, createdAt } =
        expenseObj;
      return {
        id,
        expenseAmount,
        category,
        description,
        createdAt,
        updatedAt,
      };
    });

    let csv = await convertFromJSON_to_CSV(expenses);
    //we are gonna send this csv to aws

    let fileName = `Expense${req.user.id}/${new Date()}.csv`; // will creare folder --> ExpenseUSERID -->  filennameusingDate.csv
    // csv = JSON.stringify(csv);
    let fileUrl = await uploadToS3(csv, fileName); // data and filename

    // console.log("\n\n=================> url \n", fileUrl, "\n\n");

    if (!fileUrl) {
      return res
        .status(404)
        .json({ success: false, message: "Source Not Found" });
    }

    //save as history in db
    await req.user.createDownload({
      type: "expenseReport",
      fileUrl,
      folder: `Expense${req.user.id}`,
      fileName,
    });

    res.status(200).json({ success: true, fileName, fileUrl });
  } catch (error) {
    console.log("\n\n Err in download report \n ", error, "\n\n");
    res.status(500).json({ success: false, error });
  }
};

// get download history
module.exports.getExpenseReportDownloadHistory = async (req, res) => {
  try {
    const where = {
      type: "expenseReport",
    };
    let history = await getDownloads(req, where);

    if (!history) {
      return res.status(404).json({
        success: false,
        message: "No download history Found",
      });
    }

    // if history found then
    res.json({
      success: true,
      history,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};