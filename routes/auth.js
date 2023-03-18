const { Router } = require("express");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const router = Router();
const nodemailer = require("nodemailer");
const sendgrid = require("nodemailer-sendgrid-transport");
const registerEmailMessage = require("../html/registerEmail");
const resetEmail = require("../html/resetPassword");
const keys = require("../keys/index");

const transporter = nodemailer.createTransport(
  sendgrid({
    auth: { api_key: keys.SENDGREED_API_KEY },
  })
);

router.get("/login", async (req, res) => {
  res.render("auth/login", {
    title: "Authoritation",
    isLogin: true,
    loginError: req.flash("loginError"),
    passwordError: req.flash("passwordError"),
    succes: req.flash("succes"),
    userError: req.flash("userError"),
  });
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const candidate = await User.findOne({ email });
    if (candidate) {
      isSame = await bcrypt.compare(password, candidate.password);
      if (isSame) {
        req.session.isAuthenticated = true;
        req.session.user = candidate;
        req.session.save((err) => {
          if (err) throw new Error(err);
          res.redirect("/");
        });
      } else {
        req.flash("passwordError", "Password is invalid");
        res.redirect("/auth/login#login");
      }
    } else {
      req.flash("userError", "User does not exist");
      res.redirect("/auth/login#login");
    }
  } catch (error) {
    throw new Error(error);
  }
});

router.post("/register", async (req, res) => {
  const { remail: email, rpassword: password, confirm, name } = req.body;
  const candidate = await User.findOne({ email });
  if (candidate) {
    req.flash("loginError", "User already exist");
    return res.redirect("/auth/login#login");
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const user = new User({
    email,
    name,
    password: hashPassword,
    cart: {
      items: [],
    },
  });
  await user.save();
  await transporter.sendMail(registerEmailMessage(email));
  req.flash("succes", "User has been created");
  res.redirect("/auth/login#login");
});

router.get("/logout", async (req, res) => {
  req.session.destroy(() => {
    res.redirect("/auth/login#login");
  });
});

router.get("/reset", (req, res) => {
  res.render("auth/reset", {
    title: "Reset password",
    accessError: req.flash("accessError"),
  });
});

router.post("/reset", (req, res) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        res.redirect("/auth/reset");
      }
      const token = buffer.toString("hex");
      const candidate = await User.findOne({ email: req.body.email });

      if (candidate) {
        candidate.resetToken = token;
        candidate.resetTokenExp = Date.now() + 60 * 60 * 1000;
        await candidate.save();
        await transporter.sendMail(resetEmail(candidate.email, token));
        res.redirect("/auth/login#login");
      } else {
        req.flash("accessError", "User does not exist");
        res.redirect("/auth/reset");
      }
    });
  } catch (error) {
    throw new Error(error);
  }
});

router.get("/password/:token", async (req, res) => {
  if (!req.params.token) {
    return res.redirect("/auth/login");
  }
  try {
    const user = await User({
      resetToken: req.params.token,
      resetTokenExp: { $gt: Date.now() },
    });

    if (!user) {
      return res.redirect("/auth/login");
    } else {
      res.render("auth/password", {
        title: "Reset Password",
        userId: user._id.toString(),
        token: req.params.token,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/password", async (req, res) => {
  try {
    const user = await User.findOne({
      // _id: req.body.userId,
      resetToken: req.body.token,
      resetTokenExp: { $gt: Date.now() },
    });

    if (user) {
      (user.password = await bcrypt.hash(req.body.password, 10)),
        (user.resetToken = undefined),
        (user.resetTokenExp = undefined),
        await user.save();
      req.flash("succes", "Password has been updated successfully");
      res.redirect("/auth/login");
    } else {
      req.flash("accessError", "Tokens lifetime is expired");
      res.redirect("/auth/reset");
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
