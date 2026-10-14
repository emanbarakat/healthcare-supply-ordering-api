import { LoginController } from "./../controllers/login.controller";
import express =require("express");
import {body} from "express-validator";
import {InputValidation} from "./../middelwraes/validation.middleware";

let _loginController=new LoginController();

const loginRouter=express.Router();

/**
 * login validator
 */
let loginValidator=[
    body("password").notEmpty().withMessage("password is required")
                     //.matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,1024}$/).withMessage("phone number is not valid")                

    ,body("phoneNumber")
    .if(body("type").isIn(["doctor","pharmacist","flyboy"])).bail()
    .notEmpty().withMessage("phone number is required")
    .matches(/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}$/).withMessage("phone number is not valid")                
                        
    ,body("type").notEmpty().withMessage("type is required")
                        .isIn(["doctor","pharmacist","flyboy","admin","subAdmin"]).withMessage("type value is not correct")
];

/**
 * login router
 */
loginRouter.route("/login")
              .post(loginValidator,
                    InputValidation.validate,
                    _loginController.signIn)



export default loginRouter;
