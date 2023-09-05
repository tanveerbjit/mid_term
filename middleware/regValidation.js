const asyncHandler = require("express-async-handler");
const validateHelper = require("../validators/validate")

const reg_validate = asyncHandler(async (req, res, next) => {
   await validateHelper(req, res);
   next();
});

module.exports = reg_validate;
