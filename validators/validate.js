const response = require('../util/response');
const schemaPolicy = require('../policy/schema');
const compareObjects = require('../validators/helper/compare')
const failure = require('../util/failur')

module.exports = async function validator(req,res) {
    try {
  
      let schema = schemaPolicy;
      
          let obj = {};

          if (req.method === "POST") {

            obj = compareObjects(req.body, schema, req.method);

            let len = Object.keys(obj).length;

            if (len < 1) return true;

          } else if (req.method === "PUT") {

            obj = compareObjects(req.body, schema, req.method);
            let len = Object.keys(obj).length;

            if(len<1)return;
            
            

          } else if (req.method === "DELETE") {
            if (
              req.body.hasOwnProperty("id") &&
              req.body.id !== undefined &&
              req.body.id !== ""
            ) {return;} else {
              obj = "fill the correct id property";
            }
          }
          response(res, 404, failure(obj));
       

    } catch (error) {
  
      throw error;
      
    }
  }

// const status = (msg)=>{

//   return {
//     success: false,
//     error: true,
//     status: msg,
//   };

// }




  