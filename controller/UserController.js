const UserService = require("../service_container/user_service/UserService");
const asyncHandler = require("express-async-handler");
const success = require("../helpers/success");

class AdminController {
  constructor() {
    this.UserService = UserService;
  }

  profile = asyncHandler(async (req, res) => {
    const data = await this.UserService.profile(req, res);
    data.status ? res.status(200).json(
      success("Data has found", {
        msg: data,
      })
    )
  : res.status(404);
  throw new Error("No data Found");

  });

}

module.exports = new AdminController();
