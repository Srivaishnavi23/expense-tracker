const express = require("express");

const router = express.Router();

const paymentController = require("../controllers/payment");
const userAuth = require("../middleware/auth");
router.post(
  "/create/orderId",
  userAuth.authentication,
  paymentController.postcreateOrder
);

//http://localhost:3000/payment/verify
router.post(
  "/verify",
  userAuth.authentication,
  paymentController.verifyPayment
);

module.exports = router;