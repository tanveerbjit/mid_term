const express = require("express");
const router = express.Router();
const ProductController = require("../controller/ProductController");






///////////// CRUD OPERATION

router.get("/all", ProductController.index);
router.get("/show/:slug", ProductController.show);
router.post("/order", ProductController.order);
router.get("/show-all-order", ProductController.show_order);



// router.get("/page/:offset/:limit", ProductController.pagination);
// router.get("/:type/:agg/:prop", ProductController.comparison);

module.exports = router;