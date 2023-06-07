const Razorpay = require("razorpay");
const Order = require("../models/order");

exports.postcreateOrder = async (req, res, next) => {
  try {
    console.log(req.body.amount);

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_TEST_KEY_ID,
      key_secret: process.env.RAZORPAY_TEST_KEY_SECRET,
    });

    let options = {
      amount: req.body.amount * 100, // amount is in paisa 100 paisa = 1 rs
      currency: "INR",
      receipt: require("crypto").randomBytes(8).toString("hex"),
    };
    await instance.orders.create(options, (err, order) => {
      console.log(err);
      if (err)
        return res.status(err.statusCode || 400).json({ error: err.error });

      const { id, amount, status, currency, receipt, created_at } = order;
      //   console.log("\n\n order ==> \n");
      //   console.log(order);
      // console.log(id, amount, status, currency);

      Order.create({
        userId: req.user.id,
        server_order_id: id,
        amount,
        currency,
        receipt,
        status,
        createdAt: created_at,
      })
        .then((order) => {
          //   console.log("\n\n", order, "\n");
          return res.status(202).json({
            orderId: id,
            amount,
            status,
            receipt,
            currency,
            created_at,
          });
        })
        .catch((error) => {
          console.log("\n  =====> \n", error, "\n");
          return res.status(400).json({ success: false, error: error });
        });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const payDetails = req.body;
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      receipt,
    } = payDetails;

    let userId = req.user.id;

    // find order
    let order = await Order.findOne({ where: { userId, receipt } });
    // get order id

    const { server_order_id } = order;

    let body = server_order_id + "|" + razorpay_payment_id;
    let crypto = require("crypto");
    let expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_TEST_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // update order status
      await order.update({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        isVarified: true,
        status: "verified",
      });

      await req.user.update({ membership: "premium" });

      return res.status(200).json({ signatureIsValid: true });
    }
    res.status(400).json({ signatureIsValid: false });
  } catch (error) {
    // console.log("\n\n ");
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
};