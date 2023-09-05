const mongoose = require("mongoose");

const ORDER_STATUS = {
  PROCESSED: [0, "PROCESSED"],
  DELIVERED: [1, "DELIVERED"],
  SHIPPED: [2, "SHIPPED"],
};

const OrderSchema = new mongoose.Schema(
  {
    order_number: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    orderStatus: { type: Number, default: ORDER_STATUS.PROCESSED[0] },
    orderItems: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: Number,
      },
    ],
    total_bill: { type: Number },
  },
  { timestamps: true }
);

OrderSchema.query.findPopulatedData = async function () {
  return await mongoose
    .model("Order")
    .find({}, "-_id -orderItems._id").lean()
    .populate({
      path: "user",
      select: "username email",
    })
    .populate({
      path: "orderItems.product",
      match: { price: { $lt: 200 }},
      select: "name price -_id",
    });

};



OrderSchema.pre("save", async function (next) {
  try {
    const productIds = this.products.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    let totalPrice = 0;

    this.products.forEach((item) => {
      const product = products.find((p) => p._id.equals(item.product));
      if (product) {
        totalPrice += product.price * item.quantity;
      }
    });

    this.total = totalPrice;
    next();
  } catch (error) {
    next(error);
  }
});


const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;
