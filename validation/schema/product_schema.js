const { body } = require("express-validator");

const validationRules = [
  body("name")
    .notEmpty()
    .withMessage("name must be filled")
    .bail()
    .isLength({ max: 30 })
    .withMessage("name must be at most 30 characters long")
    .bail(),
  body("price")
    .notEmpty()
    .withMessage("price must be filled")
    .bail()
    .isNumeric()
    .withMessage("price must be numeric")
    .bail()
    .isLength({ min: 5 })
    .withMessage("price must be at least 5 ")
    .bail()
    .isLength({ max: 100000000 })
    .withMessage("price must be at most 100000000 ")
    .bail(),
  body("stock")
    .notEmpty()
    .withMessage("stock must be filled")
    .bail()
    .isNumeric()
    .withMessage("stock must be numeric")
    .bail()
    .isLength({ min: 1 })
    .withMessage("stock must be at least 1 ")
    .bail()
    .isLength({ max: 10000 })
    .withMessage("stock must be at most 10000")
    .bail(),
  body("description")
    .notEmpty()
    .withMessage("description must be filled")
    .bail()
    .isLength({ min: 1 })
    .withMessage("description must be at least 10 character long")
    .bail()
    .isLength({ max: 3000 })
    .withMessage("description must be at most 30 characters long")
    .bail()
];

module.exports = validationRules;
