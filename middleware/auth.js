const User = require("../models/user");

const jwt = require("jsonwebtoken");

const authentication = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    const userObj = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
    // console.log("\n \n ", userObj);

    let user = await User.findByPk(userObj.userId);

    // console.log(user);
    req.user = user; // very Imp
    next();
  } catch (error) {
    console.log(" \n ERR in AUTH ", error);
    return res.status(401).json({ success: false });
  }
};

const isPremiumUser = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.membership == "premium") {
      next();
    } else {
      return res.status(401).json({
        success: false,
        message: "Buy Premium Membership To access this feature",
      });
    }
  } catch (error) {
    console.log("\n Error in premium auth\n ===> ", error);
    res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
};

module.exports = {
  authentication,
  isPremiumUser,
};