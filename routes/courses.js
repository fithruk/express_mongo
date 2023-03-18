const { Router } = require("express");
const auth = require("../middleWares/auth");
const Course = require("../models/course");
const router = Router();

router.get("/", async (req, res) => {
  const courses = await Course.find().populate("userId");

  const mapedCourses = req.session.user
    ? courses.map((item) => ({
        ...item._doc,
        editPermission: item.userId
          ? req.session.user._id.toString() === item.userId._id.toString()
          : false,
      }))
    : courses;

  res.render("courses", {
    title: "Courses",
    isCourses: true,
    courses: mapedCourses,
  });
});

router.get("/:id/edit", auth, async (req, res) => {
  if (!req.query.allow) {
    return res.redirect("/");
  }

  const course = await Course.findById(req.params.id);

  res.render("course-edit", {
    title: `Edit ${course.title}`,
    course,
  });
});

router.post("/edit", auth, async (req, res) => {
  const { id, ...update } = req.body;
  await Course.findByIdAndUpdate(id, update);
  res.redirect("/courses");
});

router.post("/remove", auth, async (req, res) => {
  try {
    await Course.deleteOne({ _id: req.body.id });
    res.redirect("/courses");
  } catch (error) {
    throw new Error(error);
  }
});

router.get("/:id", async (req, res) => {
  const course = await Course.findById(req.params.id);
  res.render("course", {
    layout: "empty",
    title: `Course ${course.title}`,
    course,
  });
});

module.exports = router;
