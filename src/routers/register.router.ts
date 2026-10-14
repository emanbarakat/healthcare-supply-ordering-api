import express =require("express");
import {storage,fileFilter,limits} from "./../core/imagesConfig/profileConfig"
import {cloudinary} from "./../core/utils/cloudinary";
import {body} from "express-validator";
import { RegisterController } from "../controllers/register.controller";
import {InputValidation} from "./../middelwraes/validation.middleware";
import path = require("path");
import multer = require("multer");

let _registerController=new RegisterController();
const registerRouter=express.Router();

/********************************************************************************
 * input validation
 ********************************************************************************/
let registerValidator=[
        body("fullName").notEmpty().withMessage("user name is required")
                        .isString().withMessage("user name should be charachters")
                        .isLength({min:10}).withMessage("please enter your full name min 20 cahrachters")

        ,body("password").notEmpty().withMessage("password is required")
                         //.matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,1024}$/).withMessage("phone number is not valid")                
        
        ,body("phoneNumber").notEmpty().withMessage("phone number is required")
                            .matches(/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}$/).withMessage("phone number is not valid")                
        
        ,body("whatsAppNumber").notEmpty().withMessage("whatsApp number is required")
                               .matches(/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}$/).withMessage("whatsApp number is not valid")                
        
        ,body("type").notEmpty().withMessage("type is required")
                     .isIn(["doctor","pharmacist","flyboy"]).withMessage("type value is not correct")
                
];

let forgetPasswordValidator=[
    body("phoneNumber").notEmpty().withMessage("phone number is required")
    .matches(/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}$/).withMessage("phone number is not valid")                
]
/***************************************************************************
 *  get governorates data and cities data 
 ***************************************************************************/
registerRouter.get("/governorates",_registerController.getGovernorates);
registerRouter.get("/cities/:id",_registerController.getCities);


/***************************************************************************
 *  register operation
 ***************************************************************************/
//  registerRouter;

registerRouter.route("/register")
              .all(multer({
                storage,
                fileFilter,
                limits
              }).single("profileImage"))
              .post(registerValidator,
                InputValidation.validate,
                
      async (request:any,response:any,next:any)=>{
            try{
              let result=null;
              if(request.body.type=="doctor")
              {
               
                if(request.file!=null)
                {
                  result=await cloudinary.uploader.upload(request.file?.path,{"folder":"profile/doctor", transformation: [{width: 150, height: 150}]});//, , gravity: "face"crop: "thumb"}]});
                  request.imageurl=result.secure_url;
                  request.coudinaryId=result.public_id;
                }
                else
                {
                  request.imageurl="https://res.cloudinary.com/lifeproject/image/upload/v1660477034/Profile/Doctor/avatar_yb4atz.jpg";
                  request.coudinaryId=0;
                }
              } 
              else if(request.body.type=="pharmacist")
              {
                if(request.file!=null)
                {
                  result=await cloudinary.uploader.upload(request.file?.path,{"folder":"profile/pharmacist/"+request.body.id, transformation: [{width: 150, height: 150}]});//, , gravity: "face"crop: "thumb"}]});
                  request.imageurl=result.secure_url;
                  request.coudinaryId=result.public_id;
                }
                else
                {
                  request.imageurl="https://res.cloudinary.com/lifeproject/image/upload/v1660482123/Profile/Pharmacist/avatar_tg3cwd.jpg";
                  request.coudinaryId=0;
                }
              }

              next();
            }catch(error)
            {
              next(error);
            }
        },
        _registerController.postUser)

registerRouter.post("/forgetpassword",
                    forgetPasswordValidator,
                    InputValidation.validate,
                    _registerController.forgetPassword);

export default registerRouter;
