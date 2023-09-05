const mongoose = require("mongoose");

const AuthSchema = new mongoose.Schema(
  {
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
    limit:{
      type: Number,
      default:0,
    },
    access_time:{
      type: Date,
      default: Date.now
    },
    user:{ type: mongoose.Schema.Types.ObjectId, ref: "User" },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const Auth = mongoose.model("Auth", AuthSchema);
module.exports = Auth;
