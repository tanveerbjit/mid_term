const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z]+$/, "is invalid"],
    },
    last_name: {
      type: String,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z]+$/, "is invalid"],
    },
    user_name: {
      type: String,
      lowercase: true,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z0-9]+$/, "is invalid"],
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/\S+@\S+\.\S+/, "is invalid"],
      index: true,
    },
    role: {
      type: String,
      lowercase: true,
    },

  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
