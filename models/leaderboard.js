const Sequelize = require("sequelize");

const sequelize = require("../util/database");

// create new model
const LeaderBoard = sequelize.define("leaderBoard", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },

  totalExpenses: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },

  userName: {
    type: Sequelize.STRING,
  },
});

module.exports = LeaderBoard;