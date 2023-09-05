require("../util/passport");
const express = require("express");
const router = express.Router();
const AuthController = require("../controller/AuthController");
const roleAttacher = require("../middleware/roleAttacher");
const validateToken = require("../middleware/validateToken");
const reg_validate = require("../middleware/regValidation");
const is_sucess = require("../middleware/isSuccess");
const passport = require("passport");
const reg_schema_validation = require("../validation/reg_schema_validation");
const login_schema_validation = require("../validation/login_schema_validation");
const reg_schema = require("../validation/schema/reg_schema");
const login_schema = require("../validation/schema/login_schema");



router.post(
  "/admin/registration",
  reg_schema,
  reg_schema_validation,
  roleAttacher,
  AuthController.registration
);

router.post(
  "/user/registration",
  reg_schema,
  reg_schema_validation,
  roleAttacher,
  AuthController.registration
);

router.get("/verification/:token", validateToken, AuthController.verification);

router.post("/login",login_schema,
  login_schema_validation, AuthController.login);

router.get("/logout", AuthController.logout);

router.get("/success", AuthController.google_success);

router.get("/failed", AuthController.google_failed);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/api/v1/auth/failed",
  }),
  function (req, res) {
    req.looged = true;
    res.redirect("/api/v1/auth/success");
  }
);

// router.post("/login",AuthController.login);

module.exports = router;
