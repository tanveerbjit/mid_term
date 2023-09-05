const AccountController = require("../controller/AccountController");
const response = require("../util/response");
const log = require('../log/listener');
const failure = require('../util/failur');
const mailer = require("../service_container/MailService");



module.exports = (req, res) => {


////////////// all account  
  if(req.url === '/api/v1/account/'){
    try{
      AccountController.index(req, res);
      mailer.sendEmail(
        "recipient@example.com",
        "Test Email",
        "Hello from Nodemailer and Mailtrap!"
      );
    }catch(err){
      response(res, 500, failure("Internal Server Error" ));
    }
    
  }


/////////// single account
  else if (req.url.match(/^\/api\/v1\/account\/\d+$/)) {
    try {
      const id = req.url.split("/")[4];
      req.id = id;
      AccountController.show(req, res);
    } catch (err) {
       response(res, 500, failure("Internal Server Error"));
    }
  }



  /////////// type of credit and number of transaction is grater than a specific number
  else if (
    req.url.match(
      /^\/api\/v1\/account\/(credit|debit|master)\/(eq|gt|lt|gte|lte)\/\d+$/
    )
  ) {
    try {
      const type = req.url.split("/")[4];
      const comparison = req.url.split("/")[5];
      const number = req.url.split("/")[6];
      req.data = { type, comparison, number };
      AccountController.comparison(req, res);

    } catch (err) {
      response(res, 500, failure("Internal Server Error"));
    }
  }

  ////////// pagination
  else if (req.url.match(/^\/api\/v1\/account\/page\/\d+\/\d+$/)) {
    try {
      req.page = {
        offset: req.url.split("/")[5],
        limit: req.url.split("/")[6],
      };
      AccountController.pagination(req, res);
    } catch (err) {
      response(res, 500, failure("Internal Server Error"));
    }
  } else {
    response(res, 403, failure("Illigal Methode Or Route"));
  }

};
