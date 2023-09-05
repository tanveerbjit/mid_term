const User = require("../model/User");
const success = require("../helpers/success");
const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");
const GoogleService = require("../service_container/auth_service/GoogleService");
const jwt = require("jsonwebtoken");
const TempUser = require("../model/TempUser")
const mailer = require("../service_container/MailService");
const Auth = require("../model/Auth")
const LoginAttempt = require("../model/LoginAttemptLimit"); 

class AuthController {

  constructor() {
    this.GoogleService = GoogleService;
    this.mailer = mailer;
  }



 



  //// login
  login = asyncHandler(async (req, res) => {

    const ip = req.ip.split(':').pop();
    let block=false;
    let limit;

    const {email,password} = req.body;

    const auth = await Auth.findOne({ email }).populate("user","-_id -__v -createdAt -updatedAt");
    
    ////////////// rate Limiter check
    if(auth){
      limit = await LoginAttempt.findOne({email,ip,limit:{$gte:process.env.LIMIT}});

      if (limit) {
        const timestamp = new Date(limit.timestamp);
        const timeDifference = new Date() - timestamp;
      
        // hit is crossing the limit during a time period
        if (timeDifference < 1 * 60 * 1000) {
          // The time difference is less than 1 minutes
          block = true;
        }else{
           const unblockTime = new Date(limit.timestamp.getTime() + 1 * 60 * 1000); // Unblock after 20 minutes
           if (unblockTime <= new Date()) {
           await LoginAttempt.deleteOne({ email, ip });
          }
        }
      }

      if (block) {
        // User has exceeded the login attempts limit
        return res.status(403).json({ message: "Login attempts limit exceeded. Try again later." });
      }
    }
    


    // compare password with hashedpassword
    if (auth && (await bcrypt.compare(password, auth.password))) {
      const { user_name, first_name, last_name, role, email, _id } = auth;
      
      const accessToken = jwt.sign(
        {
          user: {
            email,
            _id,
            role,
          },
        },
        process.env.ACCESS_TOKEN_SECERT,
        { expiresIn: "30m" }
      );

      res.cookie("token", accessToken, {
        httpOnly: true, // Make the cookie accessible only via HTTP(S)
        maxAge: 900000, // Set the cookie expiration time (15 minutes in milliseconds)
      });

    
      const {user} = auth;
      if(block){
        block.finOneAndDelete({ email, ip });
      }

      res.status(200).json(success(user));

    } else {
      await LoginAttempt.findOneAndUpdate(
        { email,ip },
        { $setOnInsert: { email,ip }, $inc: { limit: 1 } },
        { upsert: true, new: true }
      );
      res.status(401);
      throw new Error("email or password is not valid");
    }

     
  });


   ///// registration
   registration = asyncHandler(async (req, res) => {
    
    const { first_name, last_name, user_name, email, password } = req.body;

    const userAvailable = await Auth.find({ email });

    //// chek if user is already exist or not
    if (userAvailable.length > 0) {
      res.status(400);
      throw new Error("User already registered!");
    }

    ////Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //// create token
    req.token = jwt.sign(
      {
        user: {
          email,
        },
      },
      process.env.ACCESS_TOKEN_SECERT,
      { expiresIn: "15m" }
    );

    /// insert into database with temporary table
    const tempUser = new TempUser({
      first_name,
      last_name,
      user_name,
      email,
      password: hashedPassword,
      token: req.token,
      role: req.role,
    });

    await tempUser.save();

    //// send email
    await this.send(req, res);


  });


  /////////// verification 
  verification = asyncHandler(async (req, res) => {
    /////////////////// find if temporary user exist or not
    const { token } = req.params;
    const tempUser = await TempUser.find({ token });
  

    if (tempUser.length !== 1) {
      res.status(401);
      throw new Error("User is not authorized");
    }

    /////////////////// find if real user exist or not
    const userAvailable = await Auth.find({ email: req.email });

    console.log(userAvailable.length);

    if (userAvailable.length > 0) {
      res.status(400);
      throw new Error("User already registered!");
    }

    /// insert into database with user table
    const { _id,first_name, last_name, user_name, email, password,role } = tempUser[0];

    const user = new User({
      first_name,
      last_name,
      user_name,
      email,
      password,
      role,
    });

    await user.save();

    const auth = new Auth({
      email,
      password,
      role,
      user: user._id
    })

    await auth.save();

    console.log("new user has been created");

    /// Delete temporary data
    await TempUser.findByIdAndDelete(_id);

    //// confirmation response
    res.status(201).json(
      success("Registration successfuly", {
        msg: "you have been registered successfuly please go to login page to enter your dashboard",
      })
    );

  });



   /////////// verification 
   logout = asyncHandler(async (req, res) => {

    res.clearCookie('token');
    res.clearCookie('google-auth-session');
    res.send({success:true,failure:false,msg:'Logged Out'});

  });


  google_success = asyncHandler(async (req,res)=>{
    
      await this.GoogleService.login(req,res);
   
    
  });
  

  google_failed = (req,res)=>{
    res.send({success:false,failure:true,msg:'registered'});
  }


   async send(req, res) {
    try {
      await this.mailer.sendEmail(
        "development@bjit.com",
        "BJIT AUTH",
        this.template(req.token)
      );

      res.status(201).json(
        success("Email Has been sent", {
          msg: "Email Has been sent please check your email to complete the registration this link is valid for 15 minutes",
        })
      );
    } catch (err) {
      res.status(500);
      throw new Error("Internal Server Error");
    }
  }

  template = (link) => {
    let html = `<!DOCTYPE html>
<html>
<head>

  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <title>Email Confirmation</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style type="text/css">
  /**
   * Google webfonts. Recommended to include the .woff version for cross-client compatibility.
   */
  @media screen {
    @font-face {
      font-family: 'Source Sans Pro';
      font-style: normal;
      font-weight: 400;
      src: local('Source Sans Pro Regular'), local('SourceSansPro-Regular'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/ODelI1aHBYDBqgeIAH2zlBM0YzuT7MdOe03otPbuUS0.woff) format('woff');
    }
    @font-face {
      font-family: 'Source Sans Pro';
      font-style: normal;
      font-weight: 700;
      src: local('Source Sans Pro Bold'), local('SourceSansPro-Bold'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/toadOcfmlt9b38dHJxOBGFkQc6VGVFSmCnC_l7QZG60.woff) format('woff');
    }
  }
  /**
   * Avoid browser level font resizing.
   * 1. Windows Mobile
   * 2. iOS / OSX
   */
  body,
  table,
  td,
  a {
    -ms-text-size-adjust: 100%; /* 1 */
    -webkit-text-size-adjust: 100%; /* 2 */
  }
  /**
   * Remove extra space added to tables and cells in Outlook.
   */
  table,
  td {
    mso-table-rspace: 0pt;
    mso-table-lspace: 0pt;
  }
  /**
   * Better fluid images in Internet Explorer.
   */
  img {
    -ms-interpolation-mode: bicubic;
  }
  /**
   * Remove blue links for iOS devices.
   */
  a[x-apple-data-detectors] {
    font-family: inherit !important;
    font-size: inherit !important;
    font-weight: inherit !important;
    line-height: inherit !important;
    color: inherit !important;
    text-decoration: none !important;
  }
  /**
   * Fix centering issues in Android 4.4.
   */
  div[style*="margin: 16px 0;"] {
    margin: 0 !important;
  }
  body {
    width: 100% !important;
    height: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  /**
   * Collapse table borders to avoid space between cells.
   */
  table {
    border-collapse: collapse !important;
  }
  a {
    color: #1a82e2;
  }
  img {
    height: auto;
    line-height: 100%;
    text-decoration: none;
    border: 0;
    outline: none;
  }
  </style>

</head>
<body style="background-color: #e9ecef;">

  <!-- start preheader -->
  <div class="preheader" style="display: none; max-width: 0; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
    Welcome to BJIT Auth module
  </div>
  <!-- end preheader -->

  <!-- start body -->
  <table border="0" cellpadding="0" cellspacing="0" width="100%">

    <!-- start logo -->
    <tr>
      <td align="center" bgcolor="#e9ecef">
        <!--[if (gte mso 9)|(IE)]>
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
        <tr>
        <td align="center" valign="top" width="600">
        <![endif]-->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
          <tr>
            <td align="center" valign="top" style="padding: 36px 24px;">
              <a href="https://www.blogdesire.com" target="_blank" style="display: inline-block;">
                <img src="https://www.blogdesire.com/wp-content/uploads/2019/07/blogdesire-1.png" alt="Logo" border="0" width="48" style="display: block; width: 48px; max-width: 48px; min-width: 48px;">
              </a>
            </td>
          </tr>
        </table>
        <!--[if (gte mso 9)|(IE)]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
    <!-- end logo -->

    <!-- start hero -->
    <tr>
      <td align="center" bgcolor="#e9ecef">
        <!--[if (gte mso 9)|(IE)]>
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
        <tr>
        <td align="center" valign="top" width="600">
        <![endif]-->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
          <tr>
            <td align="left" bgcolor="#ffffff" style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;">Confirm Your Email Address</h1>
            </td>
          </tr>
        </table>
        <!--[if (gte mso 9)|(IE)]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
    <!-- end hero -->

    <!-- start copy block -->
    <tr>
      <td align="center" bgcolor="#e9ecef">
        <!--[if (gte mso 9)|(IE)]>
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
        <tr>
        <td align="center" valign="top" width="600">
        <![endif]-->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">

          <!-- start copy -->
          <tr>
            <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
              <p style="margin: 0;">Tap the button below to confirm your email address.</p>
            </td>
          </tr>
          <!-- end copy -->

          <!-- start button -->
          <tr>
            <td align="left" bgcolor="#ffffff">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" bgcolor="#ffffff" style="padding: 12px;">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" bgcolor="#1a82e2" style="border-radius: 6px;">
                          <a href="http://127.0.0.1:3000/api/v1/auth/verification/${link}" target="_blank" style="display: inline-block; padding: 16px 36px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px;">click here</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- end button -->

        


        </table>
        <!--[if (gte mso 9)|(IE)]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
    <!-- end copy block -->

   

  </table>
  <!-- end body -->

</body>
</html>`;

    return html;
  };


}

module.exports = new AuthController();
