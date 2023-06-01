const Sequelize = require("sequelize");

const sequelize = new Sequelize("expense-tracker", "root", "Srivaishu@23", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;