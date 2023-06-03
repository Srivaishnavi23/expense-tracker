const express = require("express");
const {
  resetPassword,
  resetPassLinkVerification,
  forgotPass,
} = require("../controllers/resetPassword");
const router = express.Router();

router.use("/forgotpassword", forgotPass);

router.get("/resetpasswordverify/:passResetId", resetPassLinkVerification);

router.post("/updatepassword/:passResetId", resetPassword);

module.exports = router;