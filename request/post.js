const AccountController = require("../controller/AccountController");
const getPostData = require("../util/bodyParser");
const response = require("../util/response");
const failure = require("../util/failur");

module.exports = async (req, res) => {

  if (req.url === "/api/v1/account/") {
    
    try{
      req.methodPolicy = "post";
      req.data = await getPostData(req,res);
      AccountController.store(req,res);
    }catch(err){
       response(res, 500, failure("Internal Server Error"));
    }

  }else{
     response(res, 403, failure("Illigal Methode Or Route"));
  }

};
