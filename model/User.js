const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z]+$/, "is invalid"],
      min: 3,
      max: 20,
    },
    last_name: {
      type: String,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z]+$/, "is invalid"],
      min: 3,
      max: 20,
    },
    user_name: {
      type: String,
      lowercase: true,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z0-9]+$/, "is invalid"],
      min: 3,
      max: 20,
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/\S+@\S+\.\S+/, "is invalid"],
      index: true,
      max: 30,
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
