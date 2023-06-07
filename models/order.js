const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Order = sequelize.define("Order", {
  server_order_id: Sequelize.STRING,
  razorpay_order_id: Sequelize.STRING,
  razorpay_payment_id: Sequelize.STRING,
  razorpay_signature: Sequelize.STRING,
  isVarified: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  amount: Sequelize.INTEGER,
  receipt: {
    type: Sequelize.STRING,
  },
  status: Sequelize.STRING,
});

module.exports = Order;