const response = require("../util/response");
const usuccess = require("../util/success");
const doesNotExist = require("../util/doesNotEsist");
const Product = require("../model/Product");
const asyncHandler = require("express-async-handler");
const success = require("../helpers/success");
const Order = require("../model/Order")

class ProductController {
  async index(req, res) {
    try {
      const data = await Product.find({}, "name price description -_id");
      data.length > 0
        ? response(res, 200, usuccess(data))
        : response(res, 404, doesNotExist);
    } catch (err) {
      response(res, 404, doesNotExist);
    }
  }

  async show(req, res) {
    try {
      const { slug } = req.params;
      const data = await Product.find().bySlug(slug);
      data.length > 0
        ? response(res, 200, usuccess(data))
        : response(res, 404, doesNotExist);
    } catch (err) {
      response(res, 404, doesNotExist);
    }
  }

  async store(req, res) {
    try {

      
      
      const{name,price,description,stock} = req.body;
      const { thumbImage, images } = req.files;
      console.log(thumbImage)
      const imagesPathArray = images.map((image) =>image.path.replace(/\\/g, "/"));
      const thumbImagePathArray = thumbImage.map((image) => image.path.replace(/\\/g, "/"));
      console.log(req.files)
      const product = await new Product();
      product.name = name;
      product.price = price;
      product.description = description;
      product.stock = stock;
      product.thumbImage = thumbImagePathArray[0];
      product.images = imagesPathArray;
      const savedProduct = await product.save();
      
      response(res, 201, usuccess(savedProduct));
    } catch (err) {
      response(res, 404, doesNotExist);
    }
  }

  async update(req, res) {
    try {
      const { slug } = req.params;

      const data = await Product.findOneAndUpdate({ slug }, req.body, {
        new: true,
      });

      data ? response(res, 200, data) : response(res, 404, doesNotExist);
    } catch (err) {
      response(res, 404, doesNotExist);
    }
  }

  async destroy(req, res) {
    try {
      const { slug } = req.params;

      const data = await Product.findOneAndDeleteById({ slug });

      data ? response(res, 200, data) : response(res, 404, doesNotExist);
    } catch (err) {
      response(res, 404, doesNotExist);
    }
  }

  order = asyncHandler(async (req, res) => {
    console.log("hi");
  });

  show_order = asyncHandler(async (req, res) => {
    try {
      console.log("give me the order");
      const data = await Order.find().findPopulatedData();
      const filteredData = data.filter((order) => {
        return order.orderItems.product !== null;
      });

      if (data.length > 0) {
        res.status(200).json(
          success("Data Has been Found", {
            data: filteredData,
          })
        );
      } else {
        res.status(400).json(error("No data found"));
      }
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json(error("Internal Server Error"));
    }
  });

  // show_order = asyncHandler(async (req, res) => {
  //   console.log("give me the order")
  //  const data = await Order.find().findPopulatedData();
  //  console.log(data)
  //  data.length > 0
  //    ? res.status(200).json(
  //        success("Data Has been Found", {
  //          data: data,
  //        })
  //      )
  //    : res.status(400);
  //  throw new Error("User already registered!");
  // });

  // async pagination(req, res) {
  //   try {
  //     const data = await (
  //       await (await Account.paginate()).offset(req.page)
  //     ).limit(req.page);
  //     response(res, 200, success(data));
  //   } catch (err) {
  //     response(res, 404, doesNotExist);
  //   }
  // }

  // async comparison(req, res) {
  //   try {
  //     const data = await Account.findByComparison(req.data);
  //     response(res, 200, success(data));
  //   } catch (err) {
  //     response(res, 404, doesNotExist);
  //   }
  // }

  // async aggregation(req, res) {
  //   try {
  //     const data = await Account.aggregate(req.data);
  //     response(res, 200, success(data));
  //   } catch (err) {
  //     response(res, 404, doesNotExist);
  //   }
  // }
}

module.exports = new ProductController();
