const AdminService = require("../service_container/admin_service/AdminService")
const asyncHandler = require("express-async-handler");
const success = require(".././helpers/success");
const Product = require("../model/Product");
const User = require("../model/User")

class AdminController {

  constructor() {
    this.AdminService = AdminService;
  }

  profile = asyncHandler(async (req, res) => {
    console.log(req.id);

    const data = await User.findOne({email:req.email},"-_id -__v -createdAt -updatedAt");
    console.log(data)
    
    data ? res.status(200).json(
          success("Data has found", {
            msg: data,
          })
        )
      : res.status(404);
    throw new Error("No data Found");

  });

  all_vendors = asyncHandler(async (req, res) => {

    const data = await User.find({},"-_id -__v -createdAt -updatedAt");
   
    
    data.length > 0 ? res.status(200).json(
          success("Data has found", {
            msg: data,
          })
        )
      : res.status(404);
    throw new Error("No data Found");

  });

  users_with_user_role = asyncHandler(async (req, res) => {

    const data = await User.where('role').eq('u').select("-_id -__v -createdAt -updatedAt");
   
    
    data.length > 0 ? res.status(200).json(
          success("Data has found", {
            msg: data,
          })
        )
      : res.status(404);
    throw new Error("No data Found");
  });

  users_with_admin_role = asyncHandler(async (req, res) => {

    const data = await User.where('role').eq('a').select("-_id -__v -createdAt -updatedAt");
   
    
    data.length > 0 ? res.status(200).json(
          success("Data has found", {
            msg: data,
          })
        )
      : res.status(404);
    throw new Error("No data Found");
    
  });
  
}


module.exports = new AdminController()