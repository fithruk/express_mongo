const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  cart: {
    items: [
      {
        count: {
          type: Number,
          required: true,
          default: 1,
        },
        courseId: {
          type: Schema.Types.ObjectId,
          ref: "Course",
          required: true,
        },
      },
    ],
  },
  resetToken: String,
  resetTokenExp: Date,
});

userSchema.statics.addToCart = async function (course, user) {
  const targetUser = await this.findById(user._id);

  const items = [...targetUser.cart.items];
  const idx = items.findIndex(
    (c) => c.courseId.toString() === course._id.toString()
  );

  if (idx >= 0) {
    items[idx].count = items[idx].count + 1;
  } else {
    items.push({ courseId: course._id, count: 1 });
  }

  targetUser.cart = { items };
  return targetUser.save();
};

userSchema.statics.clearCart = async function (userId) {
  const targetUser = await this.findById(userId);
  targetUser.cart.items = [];
  return targetUser.save();
};

// userSchema.statics.addToCart = function (course) {
//   const items = [...this.cart.items];
//   const idx = items.findIndex(
//     (c) => c.courseId.toString() === course._id.toString()
//   );

//   if (idx >= 0) {
//     items[idx].count = items[idx].count++;
//   } else {
//     items.push({ courseId: course._id, count: 1 });
//   }

//   this.cart = { items };
//   return this.save();
// };

module.exports = model("User", userSchema);
