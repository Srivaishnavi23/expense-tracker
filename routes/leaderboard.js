//   http://localhost:3000/leaderboard/show"

const express = require("express");
const {
  showAllLeaderbord,
  showUserExpense,
} = require("../controllers/leaderboard");
const { authentication } = require("../middleware/auth");

const router = express.Router();

router.get("/showAll", authentication, showAllLeaderbord);

router.post("/showUser", authentication, showUserExpense);

module.exports = router;