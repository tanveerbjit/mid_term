const AccountController = require("../controller/AccountController");
const getPostData = require("../util/bodyParser");
const response = require("../util/response");
const failure = require("../util/failur");

module.exports = async (req, res) => {
  if (req.url.match(/^\/api\/v1\/account\/\d+$/)) {
    try {
      req.methodPolicy = "put";
      req.doc = await getPostData(req,res);
      req.id = req.url.split("/")[4];
      AccountController.update(req, res);
    } catch (err) {
       response(res, 500, failure("Internal Server Error"));
    }
  } else {
    response(res, 403, failure("Illigal Methode Or Route"));
  }
};
