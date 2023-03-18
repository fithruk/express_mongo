const { Router } = require("express");
const auth = require("../middleWares/auth");
const User = require("../models/user");
const Course = require("../models/course");
const router = Router();

// router.post("/add", async (req, res) => {
//   const course = await Course.findById(req.body.id);

//   await req.user.addToCart(course);
//   res.redirect("/card");
// });

const mapCartItems = (cart) => {
  return cart.items.map((c) => ({
    ...c.courseId._doc,
    id: c.courseId.id,
    count: c.count,
  }));
};

const computePrice = (courses) => {
  return courses.reduce(
    (total, course) => total + course.price * course.count,
    0
  );
};

router.post("/add", auth, async (req, res) => {
  const course = await Course.findById(req.body.id);
  await User.addToCart(course, req.user);

  res.redirect("/card");
});

router.delete("/remove/:id", auth, async (req, res) => {
  const targetCourse = await Course.findById(req.params.id);
  const targetUser = await User.findById(req.user._id).populate(
    "cart.items.courseId"
  );

  const courses = mapCartItems(targetUser.cart);
  let items = [...courses].map((c) => ({
    ...c,
    courseId: c.id,
  }));
  const idx = items.findIndex(
    (c) => c._id.toString() === targetCourse.id.toString()
  );

  if (items[idx].count > 1) {
    items[idx].count = items[idx].count - 1;
  } else {
    items = items.filter(
      (c) => c.courseId.toString() !== targetCourse.id.toString()
    );
  }
  targetUser.cart.items = items;
  await targetUser.save();
  res.json({ courses: items });
});

router.get("/", auth, async (req, res) => {
  const user = await req.user.populate("cart.items.courseId");
  const courses = mapCartItems(user.cart);

  res.render("card", {
    title: "Cart",
    isCard: true,
    courses,
    price: computePrice(courses),
  });
});

module.exports = router;
