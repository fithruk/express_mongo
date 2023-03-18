const { Router } = require("express");
const auth = require("../middleWares/auth");
const Course = require("../models/course");
const router = Router();

router.get("/", auth, (req, res) => {
  res.render("add", {
    title: "Add a new course",
    isAdd: true,
  });
});

router.post("/", auth, async (req, res) => {
  const course = new Course({
    title: req.body.title,
    price: req.body.price,
    img: req.body.img,
    userId: req.user._id,
  });
  try {
    await course.save();
    res.redirect("/courses");
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = router;
