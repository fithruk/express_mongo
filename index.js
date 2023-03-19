const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");
const flash = require("connect-flash");
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session);
const homeRoutes = require("./routes/home");
const cardRoutes = require("./routes/card");
const addRoutes = require("./routes/add");
const ordersRoutes = require("./routes/orders");
const coursesRoutes = require("./routes/courses");
const authRoutes = require("./routes/auth");
const keys = require("./keys");
const varMiddleware = require("./middleWares/variables");
const userMidlleware = require("./middleWares/userMidlleware");

const app = express();

const hbs = exphbs.create({
  defaultLayout: "main",
  extname: "hbs",
});
const store = MongoStore({
  collection: "sessions",
  uri: keys.MONGODB_URI,
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "views");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: keys.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    store,
  })
);

app.use(flash());
app.use(varMiddleware);
app.use(userMidlleware);

app.use("/", homeRoutes);
app.use("/add", addRoutes);
app.use("/courses", coursesRoutes);
app.use("/card", cardRoutes);
app.use("/orders", ordersRoutes);
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await mongoose.connect(keys.MONGODB_URI);

    // const candidate = await User.findOne();
    // if (!candidate) {
    //   const user = new User({
    //     name: "Vasya",
    //     email: "vasya@gmail.com",
    //     cart: {
    //       items: [],
    //     },
    //   });

    //   await user.save();
    // }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    throw new Error(error);
  }
}

start();

module.exports = app;
