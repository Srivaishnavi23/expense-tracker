const uuid = require("uuid");
const sgMail = require("@sendgrid/mail");
const bcrypt = require("bcrypt");

const ForgotPassword = require("../models/forgotPassword");
const User = require("../models/user");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.forgotPass = async (req, res, next) => {
  try {
    const { email } = req.body;

    // console.log(
    //   "\n \nAPI =========================>\n",
    //   process.env.SENDGRID_API_KEY
    // );

    // console.log(email);

    let user = await User.findOne({ where: { email } });

    if (!user) {
      //if user not found then
      return res
        .status(404)
        .json({ success: false, message: "User Not Found " });
    }

    // else create user pass reset link
    const passResetId = uuid.v4();

    await ForgotPassword.create({
      id: passResetId,
      active: true,
      userId: user.id,
    });
    console.log("=============>\n Passres id ==> \n", passResetId, "\n\n");

    const msg = {
      to: email, // Change to your recipient
      from: process.env.SENDGRID_EMAIL, // Change to your verified sender
      subject: "Sending with SendGrid is Fun",
      text: "and easy to do anywhere, even with Node.js",
      html: `<a href="http://localhost:3000/password/resetpasswordverify/${passResetId}">Reset password</a>`,
    };

    // sending email
    await sgMail.send(msg);

    res.status(200).json({
      message: "Link to reset password sent to your mail ",
      sucess: true,
    });
  } catch (error) {
    console.error(error);
    return res.json({ message: error.message, sucess: false });
  }
};

exports.resetPassLinkVerification = async (req, res, next) => {
  try {
    const passResetId = req.params.passResetId;
    // finding password forgotpass request of user
    let forgotPassReq = await ForgotPassword.findOne({
      where: { id: passResetId },
    });

    if (forgotPassReq && forgotPassReq.active) {
      await forgotPassReq.update({ active: false });

      //send form to reset pass
      res.status(200).send(`
            <html>
                <script>
                    function formsubmitted(e)
                        {
                            e.preventDefault();
                            console.log('called')
                         }
                </script>
                <form action="/password/updatepassword/${passResetId}" method="post">
                    <label for="newPassword">Enter New password</label>
                    <input name="newPassword" type="password" required></input>
                    <button>reset password</button>
                </form>
            </html>`);

      res.end();
    } else {
      return res.status(401).json({
        sucess: false,
        message: "Invalid Password Reset Link",
      });
    }
  } catch (error) {
    console.error(error);
    return res.json({ message: error.message, sucess: false });
  }
};

exports.resetPassword = async (req, res, next) => {
  // update pass of user
  try {
    const passResetId = req.params.passResetId;

    const { newPassword } = req.body;

    let forgotPassReq = await ForgotPassword.findOne({
      where: {
        id: passResetId,
      },
    });

    // get user who's forgotPassReq is
    let user = await forgotPassReq.getUser();
    console.log("\n\n ====================> \n \n", user, "\n\n");
    if (user) {
      //   console.log("\n\n ====================> \n \n", user, "\n\n");
      const saltRounds = 10;
      bcrypt.genSalt(saltRounds, function (err, salt) {
        if (err) {
          console.log(err);
          throw new Error(err);
        }
        bcrypt.hash(newPassword, salt, function (err, hash) {
          // Store hash in your password DB.
          if (err) {
            console.log(err);
            throw new Error(err);
          }
          user.update({ password: hash }).then(() => {
            res
              .status(201)
              .json({ message: "Successfuly update the new password" });
          });
        });
      });

      await forgotPassReq.destroy();
    } else {
      return res.status(404).json({ error: "No user Exists", success: false });
    }
  } catch (error) {
    console.log(
      "\n\n =====     error in resetPassword     =====> \n \n",
      error,
      "\n\n"
    );

    return res.status(403).json({ error, success: false });
  }
};