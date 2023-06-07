const Sequelize = require("sequelize");

const sequelize = require("../util/database");

// create new model
const Expense = sequelize.define("expense", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  expenseAmount: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },

  category: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: {
    type: Sequelize.STRING,
  },
});

module.exports = Expense;