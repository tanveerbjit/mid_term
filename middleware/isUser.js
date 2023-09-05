const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const isAdmin = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;

  jwt.verify(token, process.env.ACCESS_TOKEN_SECERT, (err, decoded) => {
    if (err) {
      res.status(401);
      throw new Error("User is not authorized");
    }
    if (decoded.user.role !== "u") {
      res.status(401);
      throw new Error("User is not authorized");
    }else{
      req.email = decoded.user.email;
    }

    next();
  });
});

module.exports = isAdmin;
