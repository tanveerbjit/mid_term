const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validateToken = asyncHandler(async (req, res, next) => {

  if (req.params.token) {
    jwt.verify(
      req.params.token,
      process.env.ACCESS_TOKEN_SECERT,
      (err, decoded) => {
        if (err) {
          res.status(401);
          throw new Error("User is not authorized");
        }
        req.email = decoded.user.email;
        console.log(req.email);
        next();
      }
    );
  }else{
     res.status(401);
     throw new Error("User is not authorized or token is missing");
  }
});

module.exports = validateToken;
