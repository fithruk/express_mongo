const { Router } = require("express");
const auth = require("../middleWares/auth");
const Order = require("../models/order");
const User = require("../models/user");

const router = Router();

router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({
      "user.userId": req.user._id,
    }).populate("user.userId");

    res.render("orders", {
      isOrders: true,
      title: "Orders",
      orders: orders.map((order) => ({
        ...order._doc,
        price: order.courses.reduce((total, course) => {
          return (total += course.count * course.course.price);
        }, 0),
      })),
    });
  } catch (error) {
    throw new Error(error);
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const user = await req.user.populate("cart.items.courseId");

    const courses = user.cart.items.map((course) => ({
      course: { ...course.courseId._doc },
      count: course.count,
    }));

    const order = new Order({
      user: {
        name: user.name,
        userId: req.user._id,
      },
      courses,
    });

    await User.clearCart(req.user._id);
    await order.save();
    res.redirect("/orders");
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = router;
